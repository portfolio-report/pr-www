import { Security } from './sequelize'
import { publicSecurityAttributes } from './../securities'
import NeDB from 'nedb-promises'
import Fuse, { FuseOptions } from 'fuse.js'
import Debug from 'debug'
const log = Debug('pr-www:db')

log('Loading databases...')

export const currenciesDb = NeDB.create({
  filename: './db/currencies.db.json',
  autoload: true,
})

/**
 * Placeholder for full text search for securities
 */
let securitiesFts: Fuse<Security, FuseOptions<Security>>

/**
 * Returns full text search index for securities
 * Can return undefined if index is not ready (yet)
 */
export function getSecuritiesFts(): Fuse<Security, FuseOptions<Security>> {
  return securitiesFts
}

/**
 * Create/update the full text search index for securities
 */
export async function updateSecuritiesFts() {
  log('Creating/updating full text search index...')

  const entries: Array<Security> = await Security.findAll({
    where: { staged: false },
    attributes: publicSecurityAttributes,
  })

  const options: FuseOptions<Security> = {
    shouldSort: true,
    maxPatternLength: 32,
    minMatchCharLength: 2,
    keys: ['name', 'isin', 'wkn', 'symbolXfra', 'symbolXnas', 'symbolXnys'],
  }
  const fts = new Fuse(entries, options)

  securitiesFts = fts
  log('Full text search index created.')
}

// Initially create the full text search index
updateSecuritiesFts()
