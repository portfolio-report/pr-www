import express from 'express'
import { escapeRegExp } from 'lodash-es'
import Debug from 'debug'
import { authRequired } from './auth.js'
import { securitiesDb as db } from './inc/db.js'
const log = Debug('api:securities')

const router = express.Router()

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
})

/**
 * Delete all entries, i.e. securities
 */
router.delete('/', authRequired, async function(req, res) {
  const count = await db.remove({}, { multi: true })
  log(`Deleted ${count} entries`)
  res.send()
})

/**
 * Get single security
 */
router.route('/:uuid').get(async function(req, res) {
  const uuid = req.params.uuid

  const security = await db.findOne({
    uuid,
  })
  if (!security) {
    res.status(404).json({ message: 'Security not found.' })
    return
  }

  // Hide internal ID
  security._id = undefined

  res.json(security)
})

/**
 * Search for securities - without authentication
 */
router.route('/search/:search').get(async function(req, res) {
  const search = escapeRegExp(req.params.search) || ''
  const securityType = req.query.type || ''

  const entries = (await readSecurities({
    limit: 10,
    search,
    securityType,
  })).entries

  // Hide internal IDs
  entries.forEach(doc => {
    doc._id = undefined
  })

  res.json(entries)
})

export default router
