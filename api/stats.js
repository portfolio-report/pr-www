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
  let limit
  if (isNaN(parseInt(req.query.limit))) {
    limit = 10
  } else if (parseInt(req.query.limit) === 0) {
    limit = undefined
  } else {
    limit = parseInt(req.query.limit)
  }
  const skip = parseInt(req.query.skip) || 0
  const sort = req.query.sort || 'timestamp'
  const descending = req.query.desc === 'true'

  const result = await ClientUpdate.findAndCountAll({
    order: [[sort, descending ? 'DESC' : 'ASC']],
    limit,
    offset: skip,
  })

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
    const result = await ClientUpdate.bulkCreate(entries)
    log(`Inserted ${result.length} of ${entries.length} entries`)
    res.json({ status: 'ok' })
  }
})

/**
 * Delete single entry
 */
router.delete('/:id', authRequired, async function(req, res) {
  const id = req.params.id
  await ClientUpdate.destroy({ where: { id } })
  res.json({ status: 'ok' })
})

/**
 * Get statistics on updates
 */
router.route('/updates').get(async function(req, res) {
  let versions = await ClientUpdate.findAll({
    attributes: [
      'version',
      [Sequelize.fn('count', Sequelize.col('*')), 'count'],
      [Sequelize.fn('max', Sequelize.col('timestamp')), 'dt_last_update'],
      [Sequelize.fn('min', Sequelize.col('timestamp')), 'dt_first_update'],
    ],
    group: ['version'],
  })

  // Convert to plain objects
  versions = versions.map(v => v.toJSON())

  for (const version of versions) {
    // Add updates per day
    version.dates = await ClientUpdate.findAll({
      attributes: [
        [Sequelize.fn('date', Sequelize.col('timestamp')), 'date'],
        [Sequelize.fn('count', Sequelize.col('*')), 'count'],
      ],
      group: ['date'],
      where: { version: version.version },
    })

    // Add updates per country
    version.countries = await ClientUpdate.findAll({
      attributes: [
        [Sequelize.fn('IFNULL', Sequelize.col('country'), ''), 'country'],
        [Sequelize.fn('count', Sequelize.col('*')), 'count'],
      ],
      group: Sequelize.fn('IFNULL', Sequelize.col('country'), ''),
      where: { version: version.version },
    })
  }

  res.json({ versions })
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
