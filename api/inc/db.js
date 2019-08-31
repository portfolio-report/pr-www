import NeDB from 'nedb-promises'

export const currenciesDb = NeDB.create({
  filename: './db/currencies.db.json',
  autoload: true,
})

export const securitiesDb = NeDB.create({
  filename: './db/securities.db.json',
  autoload: true,
})

securitiesDb.ensureIndex({ fieldName: 'uuid' })
securitiesDb.ensureIndex({ fieldName: 'name' })
securitiesDb.ensureIndex({ fieldName: 'isin' })
securitiesDb.ensureIndex({ fieldName: 'wkn' })
securitiesDb.ensureIndex({ fieldName: 'security_type' })
securitiesDb.ensureIndex({ fieldName: 'markets.XFRA.symbol' })
securitiesDb.ensureIndex({ fieldName: 'markets.XNAS.symbol' })
securitiesDb.ensureIndex({ fieldName: 'markets.XNYS.symbol' })

export const securitiesStagingDb = NeDB.create({
  filename: './db/securities-staging.db.json',
  autoload: true,
})

export const statsDb = NeDB.create({
  filename: './db/stats.db.json',
  autoload: true,
})
