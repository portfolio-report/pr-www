import Sequelize from 'sequelize'
import express, { Request, Response } from 'express'
import { isAuthenticated } from './auth'
import { ExchangeRate, sequelize } from './inc/sequelize'

const router = express.Router()

/**
 * Get currencies (public)
 */
router.route('/').get(async function (_req: Request, res: Response) {
  const currencies = await sequelize.query(
    'SELECT baseCurrencyCode as currencyCode from exchangeRates UNION SELECT quoteCurrencyCode as currencyCode from exchangeRates',
    { type: Sequelize.QueryTypes.SELECT }
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

    const exchangeRates = await ExchangeRate.findAll({
      attributes: isAuthenticated(req)
        ? undefined
        : ['baseCurrencyCode', 'quoteCurrencyCode'],
      where: {
        [Sequelize.Op.or]: [
          { baseCurrencyCode: currencyCode },
          { quoteCurrencyCode: currencyCode },
        ],
      },
    })

    if (exchangeRates.length === 0) {
      return res.status(404).json({ message: 'Not found.' })
    }

    const currency = { currencyCode, exchangeRates }

    res.json(currency)
  })

export default router
