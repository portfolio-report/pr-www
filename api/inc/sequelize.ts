import { Options, Sequelize } from 'sequelize'
import Debug from 'debug'
import dbConfig from '../sequelize-config.json'
import { Security, initSecurity } from './models/Security'
import { Market, initMarket } from './models/Market'
import { Price, initPrice } from './models/Price'
import { ClientUpdate, initClientUpdate } from './models/ClientUpdate'
import { Event, initEvent } from './models/Event'
import { ExchangeRate, initExchangeRate } from './models/ExchangeRate'
import {
  ExchangeRatePrice,
  initExchangeRatePrice,
} from './models/ExchangeRatePrice'
const log = Debug('pr-www:sequelize')

export const sequelize = new Sequelize({
  ...dbConfig.development,
  logging: log,
} as Options)

initSecurity()
initMarket()
initPrice()
initClientUpdate()
initEvent()
initExchangeRate()
initExchangeRatePrice()

export {
  Security,
  Market,
  Price,
  ClientUpdate,
  Event,
  ExchangeRate,
  ExchangeRatePrice,
}
