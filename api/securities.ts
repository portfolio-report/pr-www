import Debug from 'debug'
import Sequelize from 'sequelize'
import express, { NextFunction, Request, Response } from 'express'
import { authRequired, isAuthenticated } from './auth'
import { getSecuritiesFts, updateSecuritiesFts } from './inc/fts'
import { Event, Market, Price, Security, sequelize } from './inc/sequelize'
import { HttpError } from './inc/HttpError'
const log = Debug('pr-www:securities')

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
  includeMarkets,
  includeEvents,
}: {
  limit: number
  skip: number
  sort: string
  descending: boolean
  search: string
  securityType: string
  includeMarkets: boolean
  includeEvents: boolean
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

  const where = { [Sequelize.Op.and]: filters }

  const include = []

  if (includeMarkets) {
    include.push({
      model: Market,
      attributes: [
        'marketCode',
        'currencyCode',
        'firstPriceDate',
        'lastPriceDate',
        'symbol',
        'updatePrices',
      ],
    })
  }

  if (includeEvents) {
    include.push({
      model: Event,
      attributes: ['date', 'type', 'amount', 'currencyCode'],
      where: { type: 'dividend' },
      required: false,
    })
  }

  const result = await Security.findAndCountAll({
    where,
    order: [[sort, descending ? 'DESC' : 'ASC']],
    limit,
    include,
    offset: skip,
  })

  return { entries: result.rows, params: { totalCount: result.count } }
}

/**
 * Get list of securities
 */
router.get('/', authRequired, async function (req: Request, res: Response) {
  const limit = parseInt(req.query.limit) || 10
  const skip = parseInt(req.query.skip) || 0
  const sort = req.query.sort || 'name'
  const descending = req.query.desc === 'true'
  const search = req.query.search || ''
  const securityType = req.query.securityType || ''
  const include = req.query.include || ''

  log(
    `Getting entries, limit: ${limit}, skip: ${skip}, ` +
      `sort: ${sort}, desc: ${descending}, search: ${search}, ` +
      `securityType: ${securityType}, include: ${include}`
  )

  // Disable timeouts
  req.setTimeout(0)
  res.setTimeout(0)

  const result = await readSecurities({
    limit,
    skip,
    sort,
    descending,
    search,
    securityType,
    includeMarkets: include === 'markets',
    includeEvents: true,
  })
  res.json(result)
})

/**
 * Get single security
 */
router.get('/:id', authRequired, async function (req: Request, res: Response) {
  const id = req.params.id

  const findOptions: Sequelize.FindOptions = {
    where: {
      id,
    },
    include: [
      {
        model: Market,
        attributes: [
          'marketCode',
          'currencyCode',
          'firstPriceDate',
          'lastPriceDate',
          'symbol',
          'updatePrices',
        ],
      },
    ],
  }

  const security = await Security.findOne(findOptions)

  if (!security) {
    res.status(404).json({ message: 'Security not found.' })
    return
  }

  res.json(security)
})

/**
 * Create single entry, i.e. security
 */
router.post('/', authRequired, async function (req: Request, res: Response) {
  function createUuid() {
    let dt = new Date().getTime()
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0
      dt = Math.floor(dt / 16)
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
  }

  const entry = req.body
  if (!entry.uuid) {
    entry.uuid = createUuid()
  }
  log(`Creating entry ${entry.uuid}`)
  const security = await Security.create(entry)
  res.json(security)
})

/**
 * Update single entry, i.e. security
 */
router.patch('/:id', authRequired, async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const id = req.params.id
  log(`Updating entry ${id}`)
  const security = await Security.findOne({ where: { id } })
  if (security) {
    Object.assign(security, req.body)
    await security.save()
    res.json({ status: 'ok' })
  } else {
    return next(new HttpError(404, 'Security not found'))
  }
})

/**
 * Delete single entry, i.e. security
 */
router.delete('/:id', authRequired, async function (
  req: Request,
  res: Response
) {
  const id = req.params.id
  log(`Deleting entry ${id}`)
  await Security.destroy({ where: { id } })
  res.json({ status: 'ok' })
})

/**
 * Get single security (public)
 */
router.route('/uuid/:uuid').get(async function (req: Request, res: Response) {
  const uuid = req.params.uuid

  const findOptions: Sequelize.FindOptions = isAuthenticated(req)
    ? {
        where: { uuid },
        include: [
          {
            model: Market,
          },
          { model: Event },
        ],
      }
    : {
        attributes: publicSecurityAttributes,
        where: { uuid },
        include: [
          {
            model: Market,
            attributes: [
              'marketCode',
              'currencyCode',
              'firstPriceDate',
              'lastPriceDate',
              'symbol',
            ],
          },
          {
            model: Event,
            attributes: ['date', 'type', 'amount', 'currencyCode'],
            where: { type: 'dividend' },
            required: false,
          },
        ],
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
router
  .route('/search/:search')
  .get(function (req: Request, res: Response, next: NextFunction) {
    const search = req.params.search || ''
    const securityType = req.query.securityType || ''

    const fts = getSecuritiesFts()

    // Send error message if full text search index is not ready yet
    if (!fts) {
      return next(new HttpError(503, 'Service Unavailable'))
    }

    const searchResults = fts.search(search)

    const securities: Array<Security> = [] // Array to be returned

    const minResults = Number(process.env.SEARCH_MIN_RESULTS) || 3
    const maxScore = Number(process.env.SEARCH_MAX_SCORE) || 0.001

    for (const searchResult of searchResults) {
      // Return this search result immediately if there is an exact match on ISIN or WKN
      if (
        searchResult.item.isin?.toLocaleUpperCase() === search.toUpperCase() ||
        searchResult.item.wkn?.toLocaleUpperCase() === search.toUpperCase()
      ) {
        return res.json([searchResult.item])
      }

      // Stop looping through list of results, if...
      if (
        (!searchResult.score || searchResult.score > maxScore) && // no more results below threshold score
        securities.length >= minResults // and minimum number of results is reached
      ) {
        break
      }

      // Add search result if filter on security matches (if given)
      if (!securityType || searchResult.item.securityType === securityType) {
        securities.push(searchResult.item)
      }
    }

    return res.json(securities)
  })

/**
 * Endpoint to update full text search index from current database content
 */
router.post('/search/update', authRequired, function (
  _req: Request,
  res: Response
) {
  updateSecuritiesFts()
  res.json({ status: 'ok' })
})

/**
 * Create/update market and prices
 */
router.patch('/uuid/:uuid/markets/:marketCode', authRequired, async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { uuid, marketCode } = req.params

  log(`Creating/updating market ${uuid}/${marketCode}`)

  // Disable timeouts
  req.setTimeout(0)
  res.setTimeout(0)

  const security = await Security.findOne({
    attributes: ['id'],
    where: { uuid },
  })
  if (!security || !security.id) {
    return res.status(404).json({ message: 'Security not found.' })
  }

  const entry: {
    securityId: number
    marketCode: string
    prices: Array<{ date: string; close: number }>
  } = req.body

  // Overwrite attributes if given
  entry.securityId = security.id
  entry.marketCode = marketCode

  try {
    const [market] = await Market.findOrBuild({
      where: { marketCode, securityId: security.id },
    })
    Object.assign(market, entry)
    await market.save()

    // Create/update the associated prices
    if (entry.prices) {
      await sequelize.query(
        'INSERT INTO prices (marketId, date, close) ' +
          'VALUES ' +
          entry.prices
            .map((price) => `(${market.id}, '${price.date}', ${price.close})`)
            .join(',') +
          'ON CONFLICT(marketId, date) DO UPDATE SET close=excluded.close'
      )
    }

    // Keep firstPriceDate and lastPriceDate up-to-date
    await sequelize.query(`UPDATE markets SET
    firstPriceDate = (SELECT MIN(date) FROM prices WHERE marketId = ${market.id}),
    lastPriceDate =  (SELECT MAX(date) FROM prices WHERE marketId = ${market.id})
    WHERE id = ${market.id}`)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
    return next(err)
  }

  return res.json({ status: 'ok' })
})

/**
 * Delete market (and prices)
 */
router.delete('/uuid/:uuid/markets/:marketCode', authRequired, async function (
  req: Request,
  res: Response
) {
  const { uuid, marketCode } = req.params
  log(`Deleting market ${uuid}/${marketCode}`)

  await sequelize.query(
    'DELETE FROM markets WHERE marketCode = :marketCode AND securityId IN (SELECT id FROM securities WHERE uuid = :uuid)',
    { replacements: { uuid, marketCode } }
  )

  res.json({ status: 'ok' })
})

/**
 * Get security prices (public)
 */
router
  .route('/uuid/:uuid/markets/:marketCode')
  .get(async function (req: Request, res: Response) {
    const uuid = req.params.uuid
    const marketCode = req.params.marketCode

    function getDefaultFromDate() {
      const d = new Date()
      d.setDate(d.getDate() - 14) // 14 days in the past
      return d.toISOString().substring(0, 10)
    }

    const fromDate = req.query.from || getDefaultFromDate()

    const where = { uuid }
    const security = await Security.findOne({
      where,
      attributes: publicSecurityAttributes,
      include: [
        {
          model: Market,
          attributes: [
            'marketCode',
            'currencyCode',
            'firstPriceDate',
            'lastPriceDate',
          ],
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

    if (!security?.markets) {
      res.status(404).json({ message: 'Not found.' })
      return
    }

    res.json(security.markets[0])
  })

/**
 * Create event
 */
router.post('/uuid/:uuid/events', authRequired, async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { uuid } = req.params

  const findOptions: Sequelize.FindOptions = {
    where: { uuid },
  }

  const security = await Security.findOne(findOptions)

  if (!security) {
    return res.status(404).json({ message: 'Security not found.' })
  }

  const event: {
    securityId: number
    date: string
    type: string
    amount: number
    currencyCode: string
    ratio: string
  } = req.body

  // Overwrite attributes if given
  event.securityId = security.id

  log(`Creating event @ ${uuid}/${security.id}: ${event.type}/${event.date}`)
  try {
    await Event.create(event)
  } catch (err) {
    // Unkown error
    // eslint-disable-next-line no-console
    console.log(err)
    return next(err)
  }

  return res.json({ status: 'ok' })
})

export default router
