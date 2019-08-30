import express from 'express'
import bodyParser from 'body-parser'
import { escapeRegExp } from 'lodash-es'
import Debug from 'debug'
import { authRequired } from './auth.js'
import { securitiesStagingDb as db } from './inc/db.js'
const log = Debug('api:securities-staging')

const router = express.Router()

// Parse (large) text/plain payload
router.use(bodyParser.text({ limit: '50mb' }))

// Parse (large) JSON payloads
router.use(express.json({ limit: '20mb' }))

/**
 * Read securities from db with query parameters
 */
async function readSecurities({
  limit,
  skip,
  sort,
  descending,
  search,
  securityType,
}) {
  const filters = []

  // Add filter based on search text
  if (search) {
    const regexStartIMatch = new RegExp('^' + search, 'i')
    const regexExactIMatch = new RegExp('^' + search + '$', 'i')

    filters.push({
      $or: [
        { name: { $regex: regexStartIMatch } },
        { isin: { $regex: regexExactIMatch } },
        { wkn: { $regex: regexExactIMatch } },
        { 'markets.XFRA.symbol': { $regex: regexExactIMatch } },
        { 'markets.XNAS.symbol': { $regex: regexExactIMatch } },
        { 'markets.XNYS.symbol': { $regex: regexExactIMatch } },
      ],
    })
  }

  // Add filter based on securityType
  if (securityType) {
    filters.push({ security_type: securityType })
  }

  const query = {
    $and: filters,
  }

  // Read entries
  const entries = await db
    .find(query)
    .sort({ [sort]: descending ? -1 : 1 })
    .skip(skip)
    .limit(limit)

  // Count all (matching) elements
  const totalCount = await db.count(query)

  return { entries, params: { totalCount } }
}

/**
 * Get list of securities
 */
router.get('/', authRequired, async function(req, res) {
  let limit
  if (isNaN(parseInt(req.query.limit))) {
    limit = 10
  } else if (parseInt(req.query.limit) === 0) {
    limit = undefined
  } else {
    limit = parseInt(req.query.limit)
  }
  const skip = parseInt(req.query.skip) || 0
  const sort = req.query.sort || 'name'
  const descending = req.query.desc === 'true'
  const search = escapeRegExp(req.query.search) || ''
  const securityType = req.query.security_type || ''

  res.json(
    await readSecurities({
      limit,
      skip,
      sort,
      descending,
      search,
      securityType,
    })
  )
})

/**
 * Create entries, i.e. securities
 */
router.post('/', authRequired, async function(req, res, next) {
  if (req.query.sourceFormat === undefined) {
    // expect format like in GET operations (json)

    if (req.query.multiple === undefined) {
      // Insert single entry
      const err = new Error('not implemented')
      err.statusCode = 500
      return next(err)
    } else {
      // Insert multiple entries
      const entries = req.body
      const result = await db.insert(entries)
      log(`Inserted ${result.length} of ${entries.length} entries`)
      res.json({ status: 'ok' })
    }
  } else if (req.query.sourceFormat === 'xetra') {
    if (
      !req.headers['content-type'] ||
      req.headers['content-type'] !== 'text/plain'
    ) {
      const err = new Error('Unsupported Media Type')
      err.statusCode = 415
      return next(err)
    }

    // Read Xetra CSV format
    const csv = req.body.split(/\r?\n/).map(line => line.split(';'))

    // Line 1-4: header data, single cell
    // Line 5: column names
    // Line 6...: actual data
    const headers = csv[4]
    let data = csv.slice(5)

    // Remove empty lines (e.g. last line)
    data = data.filter(line => line.length > 1)

    // Convert data lines to objects
    const entries = data.map(line => {
      const security = {}
      security.name = line[headers.indexOf('Instrument')]
      security.isin = line[headers.indexOf('ISIN')]
      security.wkn = line[headers.indexOf('WKN')].slice(-6) // Only last 6 digits,

      const symbol = line[headers.indexOf('Mnemonic')]
      security.markets = { XFRA: { symbol } }

      /* Infer security_type from Instrument Group */
      const group = line[headers.indexOf('Instrument Group')]

      const groupMapping = {
        share: ['EQ00', 'EQ01'],
        fund: ['FD00'],
        bond: ['BD00', 'BD01', 'BD02', 'BD03', 'BSB0', 'MPB2'],
        index: ['EXTE'],
        // unknown: ['BSC0', 'BSE0', 'BSG0', 'BSR0', 'BST0', 'BSW0', 'KYB0', 'KYE0', 'MPE0', 'MSB0', 'MSB1', 'MSB2', 'MSE0', 'WR00']
      }

      for (const name of Object.keys(groupMapping)) {
        if (groupMapping[name].includes(group)) {
          security.security_type = name
        }
      }

      return security
    })

    const result = await db.insert(entries)
    log(`Inserted ${result.length} of ${entries.length} entries`)
    res.json({ status: 'ok' })
  }
})

/**
 * Delete all entries, i.e. securities
 */
router.delete('/', authRequired, async function(req, res) {
  const count = await db.remove({}, { multi: true })
  log(`Deleted ${count} entries`)
  res.send()
})

export default router
