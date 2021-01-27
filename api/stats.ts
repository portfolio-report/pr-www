import express, { Request, Response } from 'express'
import Debug from 'debug'
import { Prisma } from '@prisma/client'

import { getCountryFromIp } from './inc/geoip'
import { authRequired } from './auth'
import { prisma } from './inc/prisma'

const log = Debug('pr-www:stats')

const router = express.Router()

// Parse (large) JSON payloads
router.use(express.json({ limit: '50mb' }))

/**
 * Get all entries, i.e. stats data
 */
router.get('/', authRequired, async function (req: Request, res: Response) {
  const limit = parseInt(String(req.query.limit)) || 10
  const skip = parseInt(String(req.query.skip)) || 0
  const sort = String(req.query.sort || 'timestamp')
  const descending = req.query.desc === 'true'
  const version = req.query.version

  log(
    `Getting entries, limit: ${limit}, skip: ${skip}, ` +
      `sort: ${sort}, desc: ${descending}, version: ${version}`
  )

  const where: Prisma.ClientupdateWhereInput = {}

  if (version && typeof version === 'string') {
    where.version = version
  }

  const entries = await prisma.clientupdate.findMany({
    where,
    orderBy: { [sort]: descending ? 'desc' : 'asc' },
    take: limit,
    skip,
  })

  const totalCount = await prisma.clientupdate.count()

  res.json({ entries, params: { totalCount } })
})

/**
 * Delete single entry
 */
router.delete(
  '/:id',
  authRequired,
  async function (req: Request, res: Response) {
    const id = Number(req.params.id)
    log(`Deleting entry ${id}`)
    await prisma.clientupdate.delete({ where: { id } })
    res.json({ status: 'ok' })
  }
)

/**
 * Get statistics on updates
 */
router.route('/updates').get(async function (_req, res: Response) {
  const versions = await prisma.clientupdate.groupBy({
    by: ['version'],
    count: true,
    min: { timestamp: true },
    max: { timestamp: true },
  })

  return res.json(
    versions.map((el) => ({
      version: el.version,
      count: el.count,
      firstUpdate: el.min.timestamp,
      lastUpdate: el.max.timestamp,
    }))
  )
})

router
  .route('/updates/:version')
  .get(async function (req: Request, res: Response) {
    const version = req.params.version

    const byDate = await prisma.$queryRaw`
      SELECT date(timestamp) AS date, count(*) AS count
      FROM clientupdates
      WHERE version = ${version}
      GROUP BY date
      ORDER BY date ASC;`

    const byCountry = await prisma.$queryRaw`
      SELECT COALESCE(country, '') AS country, count(*) AS count
      FROM clientupdates
      WHERE version = ${version}
      GROUP BY country;`

    return res.json({ byDate, byCountry })
  })

/**
 * Count requests (GET or HEAD) as
 * update of a certain package to a certain version
 */
router
  .route('/update/name.abuchen.portfolio/:version')
  .get(async function (req: Request, res: Response) {
    // Resolve IP to country
    const country = getCountryFromIp(req.ip)

    // Log the update to database
    const data = {
      timestamp: new Date(),
      version: req.params.version.slice(0, 20),
      country,
      useragent: req.headers['user-agent']?.slice(0, 60),
    }

    await prisma.clientupdate.create({ data })

    // Send answer to client
    res.send('ok')
  })

export default router
