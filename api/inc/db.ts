import NeDB from 'nedb-promises'
import Debug from 'debug'

const log = Debug('pr-www:db')

log('Loading databases...')

export const currenciesDb = NeDB.create({
  filename: './db/currencies.db.json',
  autoload: true,
})
