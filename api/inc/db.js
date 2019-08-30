import NeDB from 'nedb-promises'

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
