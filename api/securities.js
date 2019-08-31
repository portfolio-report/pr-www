import express from 'express'
import { escapeRegExp } from 'lodash-es'
import Debug from 'debug'
import { authRequired } from './auth.js'
import {
  securitiesDb as db,
  getSecuritiesFts as getFts,
  updateFts,
} from './inc/db.js'
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
    const regexStartIMatch = new RegExp('^' + escapeRegExp(search), 'i')

    filters.push({
      $or: [
        { name: { $regex: regexStartIMatch } },
        { isin: search.toUpperCase() },
        { wkn: search.toUpperCase() },
        { 'markets.XFRA.symbol': search.toUpperCase() },
        { 'markets.XNAS.symbol': search.toUpperCase() },
        { 'markets.XNYS.symbol': search.toUpperCase() },
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
  const search = req.query.search || ''
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
router.route('/search/:search').get(async function(req, res, next) {
  const search = req.params.search || ''
  const securityType = req.query.type || ''

  const fts = getFts()

  // Send error message if full text search index is not ready yet
  if (!fts) {
    const err = new Error('Service Unavailable')
    err.statusCode = 503
    return next(err)
  }

  let entries = await fts.search(search)

  // Filter by securityType
  if (securityType) {
    entries = entries.filter(e => e.security_type === securityType)
  }

  // Hide internal IDs
  entries.forEach(doc => {
    doc._id = undefined
  })

  // Return 10 results
  res.json(entries.slice(0, 10))
})

/**
 * Endpoint to update full text search index from current database content
 */
router.post('/search/update', authRequired, function(req, res) {
  updateFts()
  res.json({ status: 'ok' })
})

export default router
