import express from 'express'
import axios from 'axios'
import xmljs from 'xml-js'
import Debug from 'debug'
import { currenciesDb as db } from './inc/db'
const log = Debug('api:currencies')

const router = express.Router()

router.route('/').get(async function(_req, res) {
  const prices = await db.find({})

  res.json(
    prices.map(p => {
      return {
        currencyCode: p.currencyCode,
        priceCurrencyCode: p.priceCurrencyCode,
      }
    })
  )
})

const ecbCurrencies = [
  'USD',
  'JPY',
  'BGN',
  'CZK',
  'DKK',
  'GBP',
  'HUF',
  'PLN',
  'RON',
  'SEK',
  'CHF',
  'ISK',
  'NOK',
  'HRK',
  'RUB',
  'TRY',
  'AUD',
  'BRL',
  'CAD',
  'CNY',
  'HKD',
  'IDR',
  'ILS',
  'INR',
  'KRW',
  'MXN',
  'MYR',
  'NZD',
  'PHP',
  'SGD',
  'THB',
  'ZAR',
]

router
  .route('/:currencyCode/price/:priceCurrencyCode')
  .get(async function(req, res) {
    const currencyCode = req.params.currencyCode
    const priceCurrencyCode = req.params.priceCurrencyCode

    // Return static exchange rates
    if (currencyCode === 'GBP' && priceCurrencyCode === 'GBX') {
      const prices = []
      prices.push({ date: '1971-01-01', value: 100 })
      res.json({
        currencyCode,
        priceCurrencyCode,
        price: prices,
      })
      return
    } else if (currencyCode === 'USD' && priceCurrencyCode === 'AED') {
      const prices = []
      prices.push({ date: '1990-01-01', value: 3.6725 })
      res.json({
        currencyCode,
        priceCurrencyCode,
        price: prices,
      })
      return
    }

    // Search the database
    const prices = await db.findOne({
      currencyCode,
      priceCurrencyCode,
    })

    if (
      prices &&
      prices.cacheDate &&
      (new Date() - prices.cacheDate) / (1000 * 60) < 30
    ) {
      // If prices exist in cache and is not too old
      log('returning currency prices from cache')
      res.json(prices)
    } else if (
      currencyCode === 'EUR' &&
      ecbCurrencies.includes(priceCurrencyCode)
    ) {
      // If price do not exist, but we have a valid source
      const url =
        'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/' +
        priceCurrencyCode.toLowerCase() +
        '.xml'
      const response = await axios.get(url)
      const foo = JSON.parse(xmljs.xml2json(response.data, { compact: true }))
      const prices = foo.CompactData.DataSet.Series.Obs.map(el => {
        return {
          date: el._attributes.TIME_PERIOD,
          value: Number(el._attributes.OBS_VALUE),
        }
      })
      const newPrices = {
        currencyCode,
        priceCurrencyCode,
        cacheDate: new Date(),
        price: prices,
      }
      await db.update(
        {
          currencyCode,
          priceCurrencyCode,
        },
        newPrices,
        { upsert: true }
      )
      res.json(newPrices)
    } else if (!prices) {
      res.status(404).json({ message: 'Currency not found.' })
    }
  })

export default router
