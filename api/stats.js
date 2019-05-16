import express from 'express'
import NeDB from 'nedb-promises'
import geoip from 'geoip-lite'
import Debug from 'debug'
import { authRequired } from './auth.js'
const log = Debug('api:stats')

const db = NeDB.create({
  filename: './db/stats.db.json',
  autoload: true
})

const router = express.Router()

// Parse (large) JSON payloads
router.use(express.json({ limit: '20mb' }))

/**
 * Serialize entry before conversion to JSON
 */
function serialize(entry) {
  entry.dt = entry.dt.toISOString() // Convert Date to String
  return entry
}

/**
 * Deserialize entry after conversion from JSON
 */
function deserialize(entry) {
  entry.dt = new Date(entry.dt) // Convert from String to Date
  return entry
}

/**
 * Get all entries, i.e. stats data
 */
router.get('/', authRequired, async function(req, res) {
  const entries = await db.find({})

  entries.map(e => serialize(e))

  const totalCount = await db.count({})

  res.json({ entries, params: { totalCount } })
})

/**
 * Delete all entries, i.e. stats data
 */
router.delete('/', authRequired, async function(req, res) {
  const count = await db.remove({}, { multi: true })
  log(`Deleted ${count} entries`)
  res.send()
})

/**
 * Create entries, i.e. stats data
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
    entries.map(e => deserialize(e))
    const result = await db.insert(entries)
    log(`Inserted ${result.length} of ${entries.length} entries`)
    res.json({ status: 'ok' })
  }
})

/**
 * Get statistics on updates
 */
router.route('/updates').get(async function(req, res) {
  const updates = await db.find({ type: 'update' })

  const packages = {}

  updates.forEach(el => {
    /* Count updates by package */
    if (!(el.package in packages)) {
      packages[el.package] = { total: 0, versions: {} }
    }
    packages[el.package].total += 1

    /* Count updates by package/version */
    const versions = packages[el.package].versions

    if (!(el.version in versions)) {
      versions[el.version] = { total: 0, dates: {}, countries: {} }
    }

    versions[el.version].total += 1

    /* Count updates by package/version/date */
    const dates = versions[el.version].dates

    const date = el.dt.toISOString().slice(0, 10)
    if (!(date in dates)) {
      dates[date] = 0
    }

    dates[date] += 1

    /* Count updates by package/version/country */
    const countries = versions[el.version].countries

    if (!(el.country in countries)) {
      countries[el.country] = 0
    }

    countries[el.country] += 1
  })

  const result = {
    updates: {
      total: updates.length,
      packages: packages
    }
  }

  // Send answer to client
  res.json(result)
})

/**
 * Count requests (GET or HEAD) as
 * update of a certain package to a certain version
 */
router.route('/update/:package/:version').get(async function(req, res) {
  // Resolve IP to country
  const ipLookup = geoip.lookup(req.ip) || {}
  const country = ipLookup.country

  // Log the update to database
  const logLine = {
    dt: new Date(),
    type: 'update',
    package: req.params.package,
    version: req.params.version,
    country: country,
    useragent: req.headers['user-agent']
  }

  await db.insert(logLine)

  // Send answer to client
  res.send('ok')
})

export default router
