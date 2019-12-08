import NeDB from 'nedb-promises'
import Fuse from 'fuse.js'
import Debug from 'debug'
import { Security } from './sequelize.js'
import { publicSecurityAttributes } from './../securities.js'
const log = Debug('api:db')

log('Loading databases...')

export const currenciesDb = NeDB.create({
  filename: './db/currencies.db.json',
  autoload: true,
})

/**
 * Placeholder for full text search for securities
 */
let securitiesFts

/**
 * Returns full text search index for securities
 * Can return undefined if index is not ready (yet)
 */
export function getSecuritiesFts() {
  return securitiesFts
}

/**
 * Create/update the full text search index for securities
 */
export function updateSecuritiesFts() {
  log('Creating/updating full text search index...')

  Security.findAll({
    where: { staged: false },
    attributes: publicSecurityAttributes,
  })
    .then(entries => {
      const options = {
        shouldSort: true,
        maxPatternLength: 32,
        minMatchCharLength: 2,
        keys: ['name', 'isin', 'wkn', 'symbolXfra', 'symbolXnas', 'symbolXnys'],
      }
      return new Fuse(entries, options)
    })
    .then(fts => {
      securitiesFts = fts
      log('Full text search index created.')
    })
}

// Initially create the full text search index
updateSecuritiesFts()
