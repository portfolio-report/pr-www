import Fuse from 'fuse.js'
import Debug from 'debug'

import { prisma } from './prisma'

const log = Debug('pr-www:fts')

/**
 * Placeholder for full text search for securities
 */
let securitiesFts: Fuse<any>

/**
 * Search full text search index for securities
 * Returns null if index is not ready (yet)
 */
export function searchSecuritiesFts(
  query: string
): Array<Fuse.FuseResult<any>> | null {
  if (!securitiesFts) {
    return null
  }

  return securitiesFts.search(query)
}

/**
 * Create/update the full text search index for securities
 */
export async function updateSecuritiesFts() {
  log('Creating/updating full text search index...')

  const entries = await prisma.security.findMany({
    select: {
      uuid: true,
      name: true,
      isin: true,
      wkn: true,
      symbolXfra: true,
      symbolXnas: true,
      symbolXnys: true,
      securityType: true,
      markets: {
        select: {
          marketCode: true,
          symbol: true,
          firstPriceDate: true,
          lastPriceDate: true,
          currencyCode: true,
        },
      },
    },
  })

  const entriesWithDateOnly = entries.map((s) => ({
    ...s,
    uuid: s.uuid?.replace(/-/g, ''),
    markets: s.markets.map((m) => ({
      ...m,
      firstPriceDate: m.firstPriceDate?.toISOString().substring(0, 10),
      lastPriceDate: m.lastPriceDate?.toISOString().substring(0, 10),
    })),
  }))

  const options: Fuse.IFuseOptions<any> = {
    includeScore: true,
    shouldSort: true,
    minMatchCharLength: 2,
    keys: ['name', 'isin', 'wkn', 'symbolXnas', 'symbolXnys', 'markets.symbol'],
  }
  const fts = new Fuse(entriesWithDateOnly, options)

  securitiesFts = fts
  log('Full text search index created.')
}

// Initially create the full text search index
updateSecuritiesFts()
