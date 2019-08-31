import NeDB from 'nedb-promises'
import Fuse from 'fuse.js'
import Debug from 'debug'
const log = Debug('api:db')

log('Loading databases...')

export const currenciesDb = NeDB.create({
  filename: './db/currencies.db.json',
  autoload: true,
})

export const securitiesDb = NeDB.create({
  filename: './db/securities.db.json',
  autoload: true,
})

export const securitiesStagingDb = NeDB.create({
  filename: './db/securities-staging.db.json',
  autoload: true,
})

export const statsDb = NeDB.create({
  filename: './db/stats.db.json',
  autoload: true,
})

log('Creating database indices...')

securitiesDb.ensureIndex({ fieldName: 'uuid' })
securitiesDb.ensureIndex({ fieldName: 'name' })
securitiesDb.ensureIndex({ fieldName: 'isin' })
securitiesDb.ensureIndex({ fieldName: 'wkn' })
securitiesDb.ensureIndex({ fieldName: 'security_type' })
securitiesDb.ensureIndex({ fieldName: 'markets.XFRA.symbol' })
securitiesDb.ensureIndex({ fieldName: 'markets.XNAS.symbol' })
securitiesDb.ensureIndex({ fieldName: 'markets.XNYS.symbol' })

/**
 * Creates a full text search index for all database entries
 */
async function createFtsFromDb(db, options) {
  const allDocs = await db.find({})
  const fuse = await new Fuse(allDocs, options)
  return fuse
}

let securitiesFts

/**
 * Export a function to create/update the full text search index
 */
export function updateFts() {
  log('Creating/updating full text search index...')

  createFtsFromDb(securitiesDb, {
    shouldSort: true,
    maxPatternLength: 32,
    minMatchCharLength: 2,
    keys: [
      'uuid',
      'name',
      'isin',
      'wkn',
      'markets.XFRA.symbol',
      'markets.XNAS.symbol',
      'markets.XNYS.symbol',
    ],
  }).then(fts => {
    securitiesFts = fts
    log('Full text search index created.')
  })
}

// Initially create the full text search index
updateFts()

/**
 * Export a function to get the full text search index
 * Function can return undefined if index is not ready yet
 */
export function getSecuritiesFts() {
  return securitiesFts
}
