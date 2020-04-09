import NeDB from 'nedb-promises'
import Fuse, { IFuseOptions } from 'fuse.js'
import Debug from 'debug'
import { publicSecurityAttributes } from './../securities'
import { Security, Market } from './sequelize'
const log = Debug('pr-www:db')

log('Loading databases...')

export const currenciesDb = NeDB.create({
  filename: './db/currencies.db.json',
  autoload: true,
})

/**
 * Placeholder for full text search for securities
 */
let securitiesFts: Fuse<Security, IFuseOptions<Security>>

/**
 * Returns full text search index for securities
 * Can return undefined if index is not ready (yet)
 */
export function getSecuritiesFts(): Fuse<Security, IFuseOptions<Security>> {
  return securitiesFts
}

/**
 * Create/update the full text search index for securities
 */
export async function updateSecuritiesFts() {
  log('Creating/updating full text search index...')

  const entries: Array<Security> = await Security.findAll({
    where: { staged: false },
    include: [
      {
        model: Market,
        attributes: ['marketCode', 'symbol', 'firstPriceDate', 'lastPriceDate'],
      },
    ],
    attributes: publicSecurityAttributes,
  })

  const options: IFuseOptions<Security> = {
    shouldSort: true,
    minMatchCharLength: 2,
    keys: [
      'name',
      'isin',
      'wkn',
      'symbolXfra',
      'symbolXnas',
      'symbolXnys',
      'markets.symbol',
    ],
  }
  const fts = new Fuse(entries, options)

  securitiesFts = fts
  log('Full text search index created.')
}

// Initially create the full text search index
updateSecuritiesFts()
