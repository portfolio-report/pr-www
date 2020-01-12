import express from 'express'
import Debug from 'debug'
import Sequelize from 'sequelize'
import { authRequired, isAuthenticated } from './auth.js'
import { getSecuritiesFts, updateSecuritiesFts } from './inc/db.js'
import { Security, Market, Price } from './inc/sequelize.js'
const log = Debug('api:securities')

const router = express.Router()

// Parse (large) JSON payloads
router.use(express.json({ limit: '20mb' }))

export const publicSecurityAttributes = [
  'uuid',
  'name',
  'isin',
  'wkn',
  'symbolXfra',
  'symbolXnas',
  'symbolXnys',
  'securityType',
]

/**
 * Read securities from db with query parameters
 */
async function readSecurities({
  limit,
  skip,
  sort,
  descending,
  search,
  securityType,
  staged,
}) {
  const filters = []

  // Add filter based on search text
  if (search) {
    filters.push({
      [Sequelize.Op.or]: [
        { uuid: { [Sequelize.Op.like]: search } },
        { name: { [Sequelize.Op.substring]: search } },
        { isin: { [Sequelize.Op.like]: search } },
        { wkn: { [Sequelize.Op.like]: search } },
        { symbolXfra: { [Sequelize.Op.like]: search } },
        { symbolXnas: { [Sequelize.Op.like]: search } },
        { symbolXnys: { [Sequelize.Op.like]: search } },
      ],
    })
  }

  // Add filter based on securityType
  if (securityType) {
    filters.push({ securityType })
  }

  // Add filter based on staged
  if (staged !== undefined) {
    filters.push({ staged })
  }

  const where = { [Sequelize.Op.and]: filters }

  const result = await Security.findAndCountAll({
    where,
    order: [[sort, descending ? 'DESC' : 'ASC']],
    limit,
    offset: skip,
  })

  return { entries: result.rows, params: { totalCount: result.count } }
}

/**
 * Get list of securities
 */
router.get('/', authRequired, async function(req, res) {
  const limit = parseInt(req.query.limit) || 10
  const skip = parseInt(req.query.skip) || 0
  const sort = req.query.sort || 'name'
  const descending = req.query.desc === 'true'
  const search = req.query.search || ''
  const securityType = req.query.securityType || ''
  let staged
  if (req.query.staged) {
    staged = req.query.staged === 'true'
  }

  log(
    `Getting entries, limit: ${limit}, skip: ${skip}, ` +
      `sort: ${sort}, desc: ${descending}, search: ${search}, ` +
      `securityType: ${securityType}, staged: ${staged}`
  )

  const result = await readSecurities({
    limit,
    skip,
    sort,
    descending,
    search,
    securityType,
    staged,
  })
  res.json(result)
})

/**
 * Create single entry, i.e. security
 */
router.post('/', authRequired, async function(req, res) {
  function createUuid() {
    let dt = new Date().getTime()
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (dt + Math.random() * 16) % 16 | 0
      dt = Math.floor(dt / 16)
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
  }

  const entry = req.body
  if (entry.staged === false && !entry.uuid) {
    entry.uuid = createUuid()
  }
  log(`Creating entry ${entry.uuid}`)
  const security = await Security.create(entry)
  res.json(security)
})

/**
 * Update single entry, i.e. security
 */
router.patch('/:id', authRequired, async function(req, res) {
  const id = req.params.id
  log(`Updating entry ${id}`)
  const security = await Security.findOne({ where: { id } })
  Object.assign(security, req.body)
  await security.save()
  res.json({ status: 'ok' })
})

/**
 * Delete single entry, i.e. security
 */
router.delete('/:id', authRequired, async function(req, res) {
  const id = req.params.id
  log(`Deleting entry ${id}`)
  await Security.destroy({ where: { id } })
  res.json({ status: 'ok' })
})

/**
 * Get single security (public)
 */
router.route('/uuid/:uuid').get(async function(req, res) {
  const uuid = req.params.uuid

  const findOptions = {
    where: {
      staged: false,
      uuid,
    },
    include: [
      {
        model: Market,
        attributes: ['marketCode', 'currencyCode'],
      },
    ],
  }

  // Limit output if request is not authenticated
  if (!isAuthenticated(req)) {
    findOptions.attributes = publicSecurityAttributes
  }

  const security = await Security.findOne(findOptions)

  if (!security) {
    res.status(404).json({ message: 'Security not found.' })
    return
  }

  res.json(security)
})

/**
 * Search securities (public)
 */
router.route('/search/:search').get(async function(req, res, next) {
  const search = req.params.search || ''
  const securityType = req.query.securityType || ''

  const fts = getSecuritiesFts()

  // Send error message if full text search index is not ready yet
  if (!fts) {
    const err = new Error('Service Unavailable')
    err.statusCode = 503
    return next(err)
  }

  let entries = await fts.search(search)

  // Filter by securityType
  if (securityType) {
    entries = entries.filter(e => e.securityType === securityType)
  }

  // Return 10 results
  res.json(entries.slice(0, 10))
})

/**
 * Endpoint to update full text search index from current database content
 */
router.post('/search/update', authRequired, function(req, res) {
  updateSecuritiesFts()
  res.json({ status: 'ok' })
})

/**
 * Create/update market and prices
 */
router.patch('/:securityId/market/:marketCode', authRequired, async function(
  req,
  res,
  next
) {
  const { securityId, marketCode } = req.params

  const entry = req.body
  // Overwrite attributes if given
  entry.securityId = securityId
  entry.marketCode = marketCode

  log(`Creating/updating market ${securityId}/${marketCode}`)
  try {
    const [market] = await Market.findOrBuild({
      where: { marketCode, securityId },
    })
    Object.assign(market, entry)
    await market.save()

    // Create/update the associated prices
    if (entry.prices) {
      for (const newPrice of entry.prices) {
        const [price] = await Price.findOrBuild({
          where: { marketId: market.id, date: newPrice.date },
        })
        price.close = newPrice.close
        await price.save()
      }
    }
  } catch (err) {
    // Most likely problem: foreign key constraint failed
    if (!(await Security.findOne({ where: { id: securityId } })))
      return res.status(404).json({ message: 'Security not found.' })

    // Unkown error
    log(err)
    return next(err)
  }

  return res.json({ status: 'ok' })
})

/**
 * Delete market and prices
 */
router.delete('/:securityId/market/:marketCode', authRequired, async function(
  req,
  res
) {
  const { securityId, marketCode } = req.params
  log(`Deleting market ${securityId}/${marketCode}`)
  await Market.destroy({ where: { securityId, marketCode } })
  res.json({ status: 'ok' })
})

/**
 * Get security prices (public)
 */
router.route('/uuid/:uuid/market/:marketCode').get(async function(req, res) {
  const uuid = req.params.uuid
  const marketCode = req.params.marketCode

  const fromDate = req.query.from || '1900-01-01'

  const where = {
    staged: false,
    uuid,
  }
  const security = await Security.findOne({
    where,
    attributes: publicSecurityAttributes,
    include: [
      {
        model: Market,
        attributes: ['marketCode', 'currencyCode'],
        where: { marketCode },
        include: [
          {
            model: Price,
            attributes: ['date', 'close'],
            where: { date: { [Sequelize.Op.gte]: fromDate } },
            required: false,
          },
        ],
      },
    ],
  })

  if (!security) {
    res.status(404).json({ message: 'Not found.' })
    return
  }

  res.json(security.markets[0])
})

export default router
