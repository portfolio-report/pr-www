import Debug from 'debug'
import express, { NextFunction, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { authRequired, isAuthenticated } from './auth'
import { searchSecuritiesFts, updateSecuritiesFts } from './inc/fts'
import { HttpError } from './inc/HttpError'
import { prisma } from './inc/prisma'
import { createUuid } from './inc/uuid'
const log = Debug('pr-www:securities')

const router = express.Router()

// Parse (large) JSON payloads
router.use(express.json({ limit: '20mb' }))

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
  const filters: Prisma.SecurityWhereInput[] = []

  // Add filter based on search text
  if (search) {
    if (
      search.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      )
    ) {
      filters.push({
        uuid: {
          equals: search,
        },
      })
    } else {
      filters.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { isin: { equals: search, mode: 'insensitive' } },
          { wkn: { equals: search, mode: 'insensitive' } },
          { symbolXfra: { equals: search, mode: 'insensitive' } },
          { symbolXnas: { equals: search, mode: 'insensitive' } },
          { symbolXnys: { equals: search, mode: 'insensitive' } },
        ],
      })
    }
  }

  // Add filter based on securityType
  if (securityType) {
    filters.push({ securityType })
  }

  const where: Prisma.SecurityWhereInput = { AND: filters }

  const include: Prisma.SecurityInclude = {}

  if (includeMarkets) {
    include.markets = {
      select: {
        marketCode: true,
        currencyCode: true,
        firstPriceDate: true,
        lastPriceDate: true,
        symbol: true,
        updatePrices: true,
      },
    }
  }

  if (includeEvents) {
    include.events = {
      select: {
        date: true,
        type: true,
        amount: true,
        currencyCode: true,
        ratio: true,
      },
      where: { OR: [{ type: 'dividend' }, { type: 'split' }] },
    }
  }

  const totalCount = await prisma.security.count({ where })

  const entries = await prisma.security.findMany({
    where,
    orderBy: { [sort]: descending ? 'desc' : 'asc' },
    take: limit,
    skip,
    include,
  })

  return { entries, params: { totalCount } }
}

/**
 * Get list of securities
 */
router.get('/', authRequired, async function (req: Request, res: Response) {
  const limit = parseInt(String(req.query.limit)) || 10
  const skip = parseInt(String(req.query.skip)) || 0
  const sort = String(req.query.sort || 'name')
  const descending = req.query.desc === 'true'
  const search = String(req.query.search || '')
  const securityType = String(req.query.securityType || '')
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
router.get(
  '/:uuid',
  authRequired,
  async function (req: Request, res: Response) {
    const uuid = req.params.uuid

    const security = await prisma.security.findUnique({
      include: {
        markets: {
          select: {
            marketCode: true,
            currencyCode: true,
            firstPriceDate: true,
            lastPriceDate: true,
            symbol: true,
            updatePrices: true,
          },
        },
        securityTaxonomies: true,
      },
      where: { uuid },
    })

    if (!security) {
      res.status(404).json({ message: 'Security not found.' })
      return
    }

    res.json(security)
  }
)

/**
 * Create single entry, i.e. security
 */
router.post('/', authRequired, async function (req: Request, res: Response) {
  const entry = req.body
  if (!entry.uuid) {
    entry.uuid = createUuid()
  }
  log(`Creating entry ${entry.uuid}`)
  const security = await prisma.security.create({ data: entry })
  res.json(security)
})

/**
 * Update single entry, i.e. security
 */
router.patch(
  '/:uuid',
  authRequired,
  async function (req: Request, res: Response, next: NextFunction) {
    const uuid = req.params.uuid
    log(`Updating entry ${uuid}`)
    const security = await prisma.security.findUnique({ where: { uuid } })
    if (security) {
      await prisma.security.update({ data: req.body, where: { uuid } })
      res.json({ status: 'ok' })
    } else {
      return next(new HttpError(404, 'Security not found'))
    }
  }
)

/**
 * Delete single entry, i.e. security
 */
router.delete(
  '/:uuid',
  authRequired,
  async function (req: Request, res: Response) {
    const uuid = req.params.uuid
    log(`Deleting entry ${uuid}`)
    await prisma.security.delete({ where: { uuid } })
    res.json({ status: 'ok' })
  }
)

/**
 * Get single security (public)
 */
router.route('/uuid/:uuid').get(async function (req: Request, res: Response) {
  const uuid = req.params.uuid

  let security
  if (isAuthenticated(req)) {
    security = await prisma.security.findUnique({
      where: { uuid },
      include: {
        events: true,
        markets: true,
        securityTaxonomies: { select: { weight: true, taxonomyUuid: true } },
      },
    })
  } else {
    security = await prisma.security.findUnique({
      where: { uuid },
      select: {
        uuid: true,
        name: true,
        isin: true,
        wkn: true,
        symbolXfra: true,
        symbolXnas: true,
        symbolXnys: true,
        securityType: true,
        markets: {
          select: {
            marketCode: true,
            currencyCode: true,
            firstPriceDate: true,
            lastPriceDate: true,
            symbol: true,
          },
        },
        securityTaxonomies: {
          select: {
            weight: true,
            taxonomyUuid: true,
          },
        },
        events: {
          select: {
            date: true,
            type: true,
            amount: true,
            currencyCode: true,
            ratio: true,
          },
          where: {
            OR: [{ type: 'dividend' }, { type: 'split' }],
          },
        },
      },
    })
  }

  if (!security) {
    res.status(404).json({ message: 'Security not found.' })
    return
  }

  res.json({
    ...security,
    uuid: security.uuid?.replace(/-/g, ''),
    markets: security.markets.map((m) => ({
      ...m,
      firstPriceDate: m.firstPriceDate?.toISOString().substring(0, 10),
      lastPriceDate: m.lastPriceDate?.toISOString().substring(0, 10),
    })),
  })
})

/**
 * Search securities (public)
 */
router
  .route('/search/:query')
  .get(function (req: Request, res: Response, next: NextFunction) {
    const query = req.params.query || ''
    const securityType = req.query.securityType || ''

    const searchResults = searchSecuritiesFts(query)

    // Send error message if full text search index is not ready yet
    if (!searchResults) {
      return next(new HttpError(503, 'Service Unavailable'))
    }

    const securities: Array<any> = [] // Array to be returned

    const minResults = Number(process.env.SEARCH_MIN_RESULTS) || 3
    const maxScore = Number(process.env.SEARCH_MAX_SCORE) || 0.001

    for (const searchResult of searchResults) {
      // Return this search result immediately if there is an exact match on ISIN or WKN
      if (
        searchResult.item.isin?.toLocaleUpperCase() === query.toUpperCase() ||
        searchResult.item.wkn?.toLocaleUpperCase() === query.toUpperCase()
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
router.post(
  '/search/update',
  authRequired,
  function (_req: Request, res: Response) {
    updateSecuritiesFts()
    res.json({ status: 'ok' })
  }
)

/**
 * Create/update market and prices
 */
router.patch(
  '/uuid/:uuid/markets/:marketCode',
  authRequired,
  async function (req: Request, res: Response, next: NextFunction) {
    const { uuid, marketCode } = req.params

    log(`Creating/updating market ${uuid}/${marketCode}`)

    // Disable timeouts
    req.setTimeout(0)
    res.setTimeout(0)

    const security = await prisma.security.findUnique({
      select: { uuid: true },
      where: { uuid },
    })
    if (!security) {
      return res.status(404).json({ message: 'Security not found.' })
    }

    const entry: {
      securityUuid?: string
      marketCode?: string
      currencyCode?: string
      symbol?: string
      updatePrices?: boolean
      prices?: Array<{ date?: string; close?: string }>
    } = req.body

    // Overwrite attributes if given
    entry.securityUuid = security.uuid
    entry.marketCode = marketCode

    try {
      const market = await prisma.securityMarket.upsert({
        create: {
          securityUuid: entry.securityUuid,
          marketCode: entry.marketCode,
          currencyCode: entry.currencyCode,
          symbol: entry.symbol,
          updatePrices: entry.updatePrices !== false,
        },
        update: {
          updatePrices: entry.updatePrices !== false,
          currencyCode: entry.currencyCode,
          symbol: entry.symbol,
        },
        where: {
          securities_markets_security_uuid_market_code: {
            marketCode,
            securityUuid: security.uuid,
          },
        },
      })

      // Create/update the associated prices
      if (entry.prices) {
        await prisma.$executeRaw(
          'INSERT INTO prices (market_id, date, close) VALUES' +
            entry.prices
              .map((price) => `(${market.id}, '${price.date}', ${price.close})`)
              .join(',') +
            'ON CONFLICT(market_id, date) DO UPDATE SET close=excluded.close'
        )
      }

      // Keep firstPriceDate and lastPriceDate up-to-date
      await prisma.$executeRaw`
        UPDATE markets SET
        first_price_date = (SELECT MIN(date) FROM prices WHERE market_id = ${market.id}),
        last_price_date =  (SELECT MAX(date) FROM prices WHERE market_id = ${market.id})
        WHERE id = ${market.id}`
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err)
      return next(err)
    }

    return res.json({ status: 'ok' })
  }
)

/**
 * Delete market (and prices)
 */
router.delete(
  '/uuid/:uuid/markets/:marketCode',
  authRequired,
  async function (req: Request, res: Response) {
    const { uuid, marketCode } = req.params
    log(`Deleting market ${uuid}/${marketCode}`)

    await prisma.securityMarket.deleteMany({
      where: { marketCode, security: { uuid } },
    })

    res.json({ status: 'ok' })
  }
)

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

    const fromDate =
      typeof req.query.from === 'string' ? req.query.from : getDefaultFromDate()

    const market = await prisma.securityMarket.findFirst({
      where: { marketCode, security: { uuid } },
      select: {
        marketCode: true,
        currencyCode: true,
        firstPriceDate: true,
        lastPriceDate: true,
        symbol: true,
        prices: {
          select: { date: true, close: true },
          where: { date: { gte: fromDate + 'T00:00:00Z' } },
          orderBy: { date: 'asc' },
        },
      },
    })

    if (!market) {
      res.status(404).json({ message: 'Not found.' })
      return
    }

    res.json({
      ...market,
      firstPriceDate: market.firstPriceDate?.toISOString().substring(0, 10),
      lastPriceDate: market.lastPriceDate?.toISOString().substring(0, 10),
      prices: market.prices?.map((p) => ({
        date: p.date.toISOString().substring(0, 10),
        close: Number(p.close),
      })),
    })
  })

/**
 * Create/update/delete taxonomy
 */
router.patch(
  '/uuid/:uuid/taxonomies',
  authRequired,
  async function (req: Request, res: Response, next: NextFunction) {
    const securityUuid = req.params.uuid
    const taxonomyUuid =
      typeof req.body.taxonomyUuid === 'string' ? req.body.taxonomyUuid : null

    if (!taxonomyUuid) {
      return next(new HttpError(400, 'taxonomyUuid missing'))
    }

    if (typeof req.body.weight !== 'string' || req.body.weight === '') {
      log(`Deleting taxonomy for ${securityUuid}, ${taxonomyUuid}`)

      await prisma.securityTaxonomy.delete({
        where: { taxonomyUuid_securityUuid: { securityUuid, taxonomyUuid } },
      })

      return res.json({})
    } else {
      log(`Upserting taxonomies for ${securityUuid}, ${taxonomyUuid}`)

      const weight = req.body.weight

      const securityTaxonomy = await prisma.securityTaxonomy.upsert({
        where: { taxonomyUuid_securityUuid: { securityUuid, taxonomyUuid } },
        create: { securityUuid, taxonomyUuid, weight },
        update: { weight },
      })

      return res.json(securityTaxonomy)
    }
  }
)

/**
 * Create/update/delete taxonomies
 */
router.put(
  '/uuid/:uuid/taxonomies/:rootUuid',
  authRequired,
  async function (req: Request, res: Response) {
    const securityUuid = req.params.uuid
    const rootUuid = req.params.rootUuid

    // Remove securityTaxonomies which are not present any more
    await prisma.securityTaxonomy.deleteMany({
      where: {
        securityUuid,
        taxonomy: { rootUuid },
        taxonomyUuid: { notIn: req.body.map((el: any) => el.taxonomyUuid) },
      },
    })

    const ret = []

    for (const { taxonomyUuid, weight } of req.body) {
      const securityTaxonomy = await prisma.securityTaxonomy.upsert({
        where: { taxonomyUuid_securityUuid: { securityUuid, taxonomyUuid } },
        create: { securityUuid, taxonomyUuid, weight },
        update: { weight },
      })
      ret.push(securityTaxonomy)
    }

    return res.json(ret)
  }
)

/**
 * Create event
 */
router.post(
  '/uuid/:uuid/events',
  authRequired,
  async function (req: Request, res: Response, next: NextFunction) {
    const { uuid } = req.params

    const security = await prisma.security.findUnique({ where: { uuid } })

    if (!security) {
      return res.status(404).json({ message: 'Security not found.' })
    }

    const event: {
      securityUuid: string
      date: string
      type: string
      amount: number
      currencyCode: string
      ratio: string
    } = req.body

    // Overwrite attributes if given
    event.securityUuid = security.uuid

    log(`Creating event @ ${uuid}: ${event.type}/${event.date}`)
    try {
      await prisma.event.create({ data: event })
    } catch (err) {
      // Unkown error
      // eslint-disable-next-line no-console
      console.log(err)
      return next(err)
    }

    return res.json({ status: 'ok' })
  }
)

export default router
