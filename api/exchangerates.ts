import Debug from 'debug'
import express, { NextFunction, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { authRequired } from './auth'
import { prisma } from './inc/prisma'

const log = Debug('pr-www:exchangeRates')

const router = express.Router()

// Parse (large) JSON payloads
router.use(express.json({ limit: '20mb' }))

/**
 * Get exchange rates (public)
 */
router.route('/').get(async function (_req: Request, res: Response) {
  const exchangerates = await prisma.exchangerate.findMany({
    select: { baseCurrencyCode: true, quoteCurrencyCode: true },
  })

  res.json(exchangerates)
})

/**
 * Create/update exchangeRate and prices
 */
router.patch(
  '/:baseCurrencyCode/:quoteCurrencyCode/prices',
  authRequired,
  async function (req: Request, res: Response, next: NextFunction) {
    const { baseCurrencyCode, quoteCurrencyCode } = req.params

    // Disable timeouts
    req.setTimeout(0)
    res.setTimeout(0)

    const prices: Array<{ date: string; value: string }> = req.body

    log(
      `Creating/updating exchangeRate ${baseCurrencyCode}/${quoteCurrencyCode}`
    )
    try {
      const exchangerate = await prisma.exchangerate.findUnique({
        where: {
          baseCurrencyCode_quoteCurrencyCode: {
            baseCurrencyCode,
            quoteCurrencyCode,
          },
        },
      })

      if (!exchangerate) {
        return res.status(404).json({ message: 'Not found.' })
      }

      // Create/update the associated prices
      if (prices) {
        await prisma.$executeRaw(
          'INSERT INTO exchangerates_prices (exchangerate_id, date, value) ' +
            'VALUES ' +
            prices
              .map(
                (price) =>
                  `(${exchangerate.id}, '${price.date}', ${price.value})`
              )
              .join(',') +
            ' ON CONFLICT(exchangerate_id, date) DO UPDATE SET value=excluded.value'
        )
      }
    } catch (err) {
      // Unkown error
      // eslint-disable-next-line no-console
      console.log(err)
      return next(err)
    }

    return res.json({ status: 'ok' })
  }
)

/**
 * Get single exchange rate (public)
 */
router
  .route('/:baseCurrencyCode/:quoteCurrencyCode')
  .get(async function (req: Request, res: Response) {
    const { baseCurrencyCode, quoteCurrencyCode } = req.params

    const exchangerate = await prisma.exchangerate.findUnique({
      select: { baseCurrencyCode: true, quoteCurrencyCode: true },
      where: {
        baseCurrencyCode_quoteCurrencyCode: {
          quoteCurrencyCode,
          baseCurrencyCode,
        },
      },
    })

    if (!exchangerate) {
      res.status(404).json({ message: 'Not found.' })
      return
    }

    res.json(exchangerate)
  })

/**
 * Get prices of exchange rate (public)
 */
router
  .route('/:baseCurrencyCode/:quoteCurrencyCode/prices')
  .get(async function (req: Request, res: Response) {
    const { baseCurrencyCode, quoteCurrencyCode } = req.params
    const { from } = req.query

    let priceWhere: Prisma.ExchangeratePriceWhereInput = {}
    if (typeof from === 'string') {
      priceWhere = { date: { gte: new Date(from) } }
    }

    const exchangerate = await prisma.exchangerate.findUnique({
      where: {
        baseCurrencyCode_quoteCurrencyCode: {
          quoteCurrencyCode,
          baseCurrencyCode,
        },
      },
      include: {
        prices: {
          select: { date: true, value: true },
          orderBy: { date: 'asc' },
          where: priceWhere,
        },
      },
    })

    if (!exchangerate) {
      res.status(404).json({ message: 'Not found.' })
      return
    }

    res.json(
      exchangerate.prices.map((el) => ({
        date: el.date.toISOString().substring(0, 10),
        value: el.value,
      }))
    )
  })

export default router
