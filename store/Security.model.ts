import type { SecurityTaxonomy } from './SecurityTaxonomy.model'

export interface Security {
  uuid?: string | null
  name: string | null
  isin: string | null
  wkn: string | null
  code: string
  securityType: string | null
}

export interface SecurityV1 {
  uuid: string
  name: string
  isin: string
  wkn: string
  code: string
  tags: string[]
  securityType: string
  pricesAvailable: boolean
}

export interface Market {
  marketCode: string
  currencyCode: string
  symbol: string
  firstPriceDate: string | null
  lastPriceDate: string | null
}

export interface EditMarket {
  marketCode: string
  currencyCode: string
  symbol: string
  updatePrices: boolean
}

export interface Event {
  date: string
  type: string
  amount: string | null
  currencyCode: string | null
  ratio: string | null
}

export interface SecurityAPI extends Security {
  events: Event[]
  securityTaxonomies: SecurityTaxonomy[]
  logoUrl: string | null
  tags: string[]
  pricesAvailable: boolean
}
