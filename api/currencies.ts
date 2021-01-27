import express, { Request, Response } from 'express'

import { prisma } from './inc/prisma'

const router = express.Router()

/**
 * Get currencies (public)
 */
router.route('/').get(async function (_req: Request, res: Response) {
  const currencies = await prisma.$queryRaw(
    'SELECT DISTINCT base_currency_code as "currencyCode" from exchangerates ' +
      'UNION SELECT DISTINCT quote_currency_code as "currencyCode" from exchangerates'
  )

  res.json(currencies)
})

/**
 *  Get single currency (public)
 */
router
  .route('/:currencyCode')
  .get(async function (req: Request, res: Response) {
    const { currencyCode } = req.params

    const exchangerates = await prisma.exchangerate.findMany({
      select: { baseCurrencyCode: true, quoteCurrencyCode: true },
      where: {
        OR: [
          { baseCurrencyCode: currencyCode },
          { quoteCurrencyCode: currencyCode },
        ],
      },
    })

    if (exchangerates.length === 0) {
      return res.status(404).json({ message: 'Not found.' })
    }

    const currency = { currencyCode, exchangerates }

    res.json(currency)
  })

export default router
