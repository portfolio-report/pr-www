import express from 'express'
import NeDB from 'nedb-promises'
import { escapeRegExp } from 'lodash-es'
import { authRequired } from './auth.js'

const db = NeDB.create({
  filename: './db/securities.db.json',
  autoload: true
})

const router = express.Router()

/**
 * Read securities from db with query parameters
 */
async function readSecurities({
  limit,
  skip,
  sort,
  descending,
  search,
  securityType
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
        { 'markets.XNYS.symbol': { $regex: regexExactIMatch } }
      ]
    })
  }

  // Add filter based on securityType
  if (securityType) {
    filters.push({ security_type: securityType })
  }

  const query = {
    $and: filters
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
  const limit = parseInt(req.query.limit) || 10
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
      securityType
    })
  )
})

/**
 * Get single security
 */
router.route('/:uuid').get(async function(req, res) {
  const uuid = req.params.uuid

  const security = await db.findOne({
    uuid: uuid
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
    securityType
  })).entries

  // Hide internal IDs
  entries.forEach(doc => {
    doc._id = undefined
  })

  res.json(entries)
})

export default router
