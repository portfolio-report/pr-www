import { Sequelize } from 'sequelize'
import Debug from 'debug'
import { Security, initSecurity } from './models/Security'
import { Market, initMarket } from './models/Market'
import { Price, initPrice } from './models/Price'
import { Event, initEvent } from './models/Event'
const log = Debug('pr-www:sequelize')

export const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  logging: log,
})

initSecurity()
initMarket()
initPrice()
initEvent()

export { Security, Market, Price, Event }
