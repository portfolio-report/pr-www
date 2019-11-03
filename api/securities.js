import express from 'express'
import Debug from 'debug'
import Sequelize from 'sequelize'
import { authRequired } from './auth.js'
import { getSecuritiesFts, updateSecuritiesFts } from './inc/db.js'
import { Security } from './inc/sequelize.js'
const log = Debug('api:securities')

const router = express.Router()

// Parse (large) JSON payloads
router.use(express.json({ limit: '20mb' }))

const publicSecurityAttributes = [
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
}) {
  const filters = []

  // Add filter based on search text
  if (search) {
    filters.push({
      [Sequelize.Op.or]: [
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

  const where = {
    [Sequelize.Op.and]: [{ staged: false }, { [Sequelize.Op.and]: filters }],
  }

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
  let limit
  if (isNaN(parseInt(req.query.limit))) {
    limit = 10
  } else if (parseInt(req.query.limit) === 0) {
    limit = undefined
  } else {
    limit = parseInt(req.query.limit)
  }
  const skip = parseInt(req.query.skip) || 0
  const sort = req.query.sort || 'name'
  const descending = req.query.desc === 'true'
  const search = req.query.search || ''
  const securityType = req.query.securityType || ''

  const result = await readSecurities({
    limit,
    skip,
    sort,
    descending,
    search,
    securityType,
  })
  res.json(result)
})

/**
 * Create entries, i.e. securities
 */
router.post('/', authRequired, async function(req, res, next) {
  if (req.query.multiple === undefined) {
    // Insert single entry
    const err = new Error('not implemented')
    err.statusCode = 500
    return next(err)
  } else {
    // Insert multiple entries
    const entries = req.body
    const result = await Security.bulkCreate(entries)
    log(`Inserted ${result.length} of ${entries.length} entries`)
    res.json({ status: 'ok' })
  }
})

/**
 * Delete all entries, i.e. securities
 */
router.delete('/', authRequired, async function(req, res) {
  const count = await Security.destroy({ where: { staged: false } })
  log(`Deleted ${count} entries`)
  res.send()
})

/**
 * Get single security (public, deprecated)
 */
router.route('/:uuid').get(async function(req, res) {
  const uuid = req.params.uuid

  const where = {
    [Sequelize.Op.and]: [{ staged: false }, { uuid }],
  }
  const security = await Security.findOne({ where })

  if (!security) {
    res.status(404).json({ message: 'Security not found.' })
    return
  }

  res.json(security.toApiFormat())
})

/**
 * Get single security (public)
 */
router.route('/uuid/:uuid').get(async function(req, res) {
  const uuid = req.params.uuid

  const where = {
    staged: false,
    uuid,
  }
  const security = await Security.findOne({
    where,
    attributes: publicSecurityAttributes,
  })

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
  const securityType = req.query.securityType || req.query.type || ''

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

  // Hide internal IDs
  entries.forEach(doc => {
    doc._id = undefined
  })

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

export default router
