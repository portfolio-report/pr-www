import express from 'express'
import geoip from 'geoip-lite'
import Debug from 'debug'
import Sequelize from 'sequelize'
import { authRequired } from './auth.js'
import { ClientUpdate } from './inc/sequelize.js'
const log = Debug('api:stats')

const router = express.Router()

// Parse (large) JSON payloads
router.use(express.json({ limit: '50mb' }))

/**
 * Get all entries, i.e. stats data
 */
router.get('/', authRequired, async function(req, res) {
  const result = await ClientUpdate.findAndCountAll()

  res.json({ entries: result.rows, params: { totalCount: result.count } })
})

/**
 * Delete all entries, i.e. stats data
 */
router.delete('/', authRequired, async function(req, res) {
  const count = await ClientUpdate.destroy({ truncate: true })
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
    entries.map(e => {
      if (!e.timestamp) {
        e.timestamp = e.dt
      }
    })
    const result = await ClientUpdate.bulkCreate(entries)
    log(`Inserted ${result.length} of ${entries.length} entries`)
    res.json({ status: 'ok' })
  }
})

/**
 * Get statistics on updates
 */
router.route('/updates').get(async function(req, res) {
  const updates = await ClientUpdate.findAll()

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

    const date = el.timestamp.toISOString().slice(0, 10)
    if (!(date in dates)) {
      dates[date] = 0
    }

    dates[date] += 1

    /* Find first and last updates of a given package/version */
    if (
      versions[el.version].dt_first_update === undefined ||
      versions[el.version].dt_first_update > el.timestamp
    ) {
      versions[el.version].dt_first_update = el.timestamp
    }

    if (
      versions[el.version].dt_last_update === undefined ||
      versions[el.version].dt_last_update < el.timestamp
    ) {
      versions[el.version].dt_last_update = el.timestamp
    }

    /* Country: Merge undefined and empty string */
    if (el.country === undefined) el.country = ''

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
      packages,
    },
  }

  // Send answer to client
  res.json(result)
})

/**
 * Count requests (GET or HEAD) as
 * update of a certain package to a certain version
 */
router
  .route('/update/name.abuchen.portfolio/:version')
  .get(async function(req, res) {
    // Resolve IP to country
    const ipLookup = geoip.lookup(req.ip) || {}
    const country = ipLookup.country

    // Log the update to database
    const entry = {
      timestamp: new Date(),
      version: req.params.version,
      country,
      useragent: req.headers['user-agent'],
    }

    await ClientUpdate.create(entry)

    // Send answer to client
    res.send('ok')
  })

export default router
