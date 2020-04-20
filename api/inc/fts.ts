import Fuse from 'fuse.js'
import Debug from 'debug'
import { Security, Market } from './sequelize'
import { publicSecurityAttributes } from './../securities'

const log = Debug('pr-www:fts')

/**
 * Placeholder for full text search for securities
 */
let securitiesFts: Fuse<Security, Fuse.IFuseOptions<Security>>

/**
 * Returns full text search index for securities
 * Can return undefined if index is not ready (yet)
 */
export function getSecuritiesFts(): Fuse<
  Security,
  Fuse.IFuseOptions<Security>
> {
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

  const options: Fuse.IFuseOptions<Security> = {
    includeScore: true,
    shouldSort: true,
    minMatchCharLength: 2,
    keys: ['name', 'isin', 'wkn', 'symbolXnas', 'symbolXnys', 'markets.symbol'],
  }
  const fts = new Fuse(entries, options)

  securitiesFts = fts
  log('Full text search index created.')
}

// Initially create the full text search index
updateSecuritiesFts()
