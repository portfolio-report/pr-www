import { getCountryFromIp } from './inc/geoip'
import { authRequired } from './auth'
import { ClientUpdate } from './inc/sequelize'
import express, { Request, Response } from 'express'
import Debug from 'debug'
import Sequelize from 'sequelize'
const log = Debug('api:stats')

const router = express.Router()

// Parse (large) JSON payloads
router.use(express.json({ limit: '50mb' }))

/**
 * Get all entries, i.e. stats data
 */
router.get('/', authRequired, async function(req: Request, res: Response) {
  const limit = parseInt(req.query.limit) || 10
  const skip = parseInt(req.query.skip) || 0
  const sort = req.query.sort || 'timestamp'
  const descending = req.query.desc === 'true'
  const version = req.query.version

  log(
    `Getting entries, limit: ${limit}, skip: ${skip}, ` +
      `sort: ${sort}, desc: ${descending}, version: ${version}`
  )

  const filters = []

  if (version) {
    filters.push({ version })
  }

  const where = { [Sequelize.Op.and]: filters }

  const result = await ClientUpdate.findAndCountAll({
    where,
    order: [[sort, descending ? 'DESC' : 'ASC']],
    limit,
    offset: skip,
  })

  res.json({ entries: result.rows, params: { totalCount: result.count } })
})

/**
 * Delete single entry
 */
router.delete('/:id', authRequired, async function(
  req: Request,
  res: Response
) {
  const id = req.params.id
  log(`Deleting entry ${id}`)
  await ClientUpdate.destroy({ where: { id } })
  res.json({ status: 'ok' })
})

/**
 * Get statistics on updates
 */
router.route('/updates').get(async function(_req, res: Response) {
  const versionsObj = await ClientUpdate.findAll({
    attributes: [
      'version',
      [Sequelize.fn('count', Sequelize.col('*')), 'count'],
      [Sequelize.fn('max', Sequelize.col('timestamp')), 'dt_last_update'],
      [Sequelize.fn('min', Sequelize.col('timestamp')), 'dt_first_update'],
    ],
    group: ['version'],
  })

  // Convert to plain objects
  const versions: Array<any> = versionsObj.map(v => v.toJSON())

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
  .get(async function(req: Request, res: Response) {
    // Resolve IP to country
    const country = getCountryFromIp(req.ip)

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
