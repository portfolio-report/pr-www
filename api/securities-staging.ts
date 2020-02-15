import { authRequired } from './auth'
import { sequelize, Security } from './inc/sequelize'
import { HttpError } from './inc/HttpError'
import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import Debug from 'debug'
import { QueryTypes } from 'sequelize'
const log = Debug('pr-www:securities-staging')

const router = express.Router()

// Parse (large) text/plain payload
router.use(bodyParser.text({ limit: '50mb' }))

// Parse (large) JSON payloads
router.use(express.json({ limit: '20mb' }))

/**
 * Create entries, i.e. staged securities
 */
router.post('/', authRequired, async function(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.query.sourceFormat === undefined) {
    // expect format like in GET operations (json)

    return next(new HttpError(500, 'not implemented'))
  } else if (req.query.sourceFormat === 'xetra') {
    if (
      !req.headers['content-type'] ||
      req.headers['content-type'] !== 'text/plain'
    ) {
      return next(new HttpError(415, 'Unsupported Media Type'))
    }

    // Read Xetra CSV format
    const csv = req.body.split(/\r?\n/).map((line: string) => line.split(';'))

    // Line 1-4: header data, single cell
    // Line 5: column names
    // Line 6...: actual data
    const headers = csv[4]
    let data = csv.slice(5)

    // Remove empty lines (e.g. last line)
    data = data.filter((line: any) => line.length > 1)

    // Only accept MIC XFRA (Frankfurt) or empty (indexes)
    data = data.filter(
      (line: any) =>
        line[headers.indexOf('MIC Code')] === 'XFRA' ||
        line[headers.indexOf('MIC Code')] === ''
    )

    // Convert data lines to objects
    const entries = data.map((line: any) => {
      const security: {
        staged?: boolean
        name?: string
        isin?: string
        wkn?: string
        symbolXfra?: string
        securityType?: 'share' | 'fund' | 'bond' | 'index'
      } = {}
      security.staged = true
      security.name = line[headers.indexOf('Instrument')]
      security.isin = line[headers.indexOf('ISIN')]
      security.wkn = line[headers.indexOf('WKN')].slice(-6) // Only last 6 digits,
      security.symbolXfra = line[headers.indexOf('Mnemonic')]

      /* Infer securityType from Instrument Group */
      const groupMapping: {
        [key: string]: 'share' | 'fund' | 'bond' | 'index'
      } = {
        EQ00: 'share',
        EQ01: 'share',
        FD00: 'fund',
        BD00: 'bond',
        BD01: 'bond',
        BD02: 'bond',
        BD03: 'bond',
        BSB0: 'bond',
        MPB2: 'bond',
        EXTE: 'index',
        // unknown: 'BSC0', 'BSE0', 'BSG0', 'BSR0', 'BST0', 'BSW0', 'KYB0', 'KYE0', 'MPE0', 'MSB0', 'MSB1', 'MSB2', 'MSE0', 'WR00'
      }
      security.securityType =
        groupMapping[line[headers.indexOf('Instrument Group')]] || null

      return security
    })

    const result = await Security.bulkCreate(entries)
    log(`Inserted ${result.length} of ${entries.length} entries`)
    res.json({ status: 'ok' })
  }
})

/**
 * Delete all entries, i.e. staged securities
 */
router.delete('/', authRequired, async function(_req: Request, res: Response) {
  const count = await Security.destroy({ where: { staged: true } })
  log(`Deleted ${count} entries`)
  res.send()
})

router.get('/stats', authRequired, async function(
  _req: Request,
  res: Response
) {
  // Count securities
  const countSecurities = await Security.count({ where: { staged: false } })
  const countStagedSecurities = await Security.count({
    where: { staged: true },
  })
  const countStagedSecuritiesNoUuid = await Security.count({
    where: { staged: true, uuid: null },
  })

  // Check for non-unique ISINs of unstaged and staged securities
  const duplicateIsins = []
  for (const staged of [0, 1]) {
    duplicateIsins[
      staged
    ] = ((await sequelize.query(
      `SELECT isin FROM securities WHERE staged = :staged GROUP BY isin HAVING COUNT(*) > 1`,
      { type: QueryTypes.SELECT, replacements: { staged } }
    )) as Array<{ isin: string }>).map(e => e.isin)
  }

  res.json({
    countSecurities,
    countStagedSecurities,
    countStagedSecuritiesNoUuid,
    duplicateIsins: duplicateIsins[0],
    duplicateIsinsStaged: duplicateIsins[1],
  })
})

/**
 * Match staged with unstaged securities based on key field (exact match)
 */
router.post('/match/:key', authRequired, async function(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const key = req.params.key

  if (!['name', 'isin', 'wkn', 'symbolXfra'].includes(key)) {
    log(`Cannot match staged securities by ${key}`)
    return next(new HttpError(404, 'Page not found'))
  }

  log(`Matching staged securities by ${key}`)

  // Take over UUID from securities with matching key field
  await sequelize.query(
    `UPDATE securities
     SET
      uuid = (SELECT s2.uuid FROM securities s2
              WHERE s2.staged = 0
                AND s2.${key} = securities.${key}
             )
    WHERE uuid IS NULL
      AND staged = 1
      /* Only copy from securities with unique key fields */
      AND 1 = (SELECT COUNT(*) FROM securities s2
               WHERE s2.staged = 0
                 AND s2.${key} = securities.${key}
              )
      /* Only apply on staged securities with unique key fields */
      AND 1 = (SELECT COUNT(*) FROM securities s2
               WHERE s2.staged = 1
                 AND s2.${key} = securities.${key}
              )
    `
  )

  res.json({ status: 'ok' })
})

/**
 * Remove matches of unstaged securities
 */
router.delete('/match/', authRequired, async function(
  _req: Request,
  res: Response
) {
  log(`Delete matches of staged securities`)

  await sequelize.query(
    `UPDATE securities
     SET
      uuid = NULL
    WHERE staged = 1 AND uuid IS NOT NULL
    `
  )

  res.json({ status: 'ok' })
})

/**
 * Get all changes comparing staged and unstaged security (with same UUID)
 */
router.get('/compare/changes', authRequired, async function(
  req: Request,
  res: Response
) {
  const limit = parseInt(req.query.limit) || 10
  const skip = parseInt(req.query.skip) || 0
  const sort = req.query.sort || 'uuid'
  const descending = req.query.desc === 'true'

  log(
    `Getting changed entries, limit: ${limit}, skip: ${skip}, ` +
      `sort: ${sort}, desc: ${descending}`
  )

  const sqlFromWhere = `FROM securities s
                        INNER JOIN securities ss ON (s.uuid = ss.uuid AND s.staged = 0 AND ss.staged = 1)
                        WHERE s.name != ss.name
                           OR s.isin != ss.isin
                           OR s.wkn != ss.wkn
                           OR s.symbolXfra != ss.symbolXfra
                           OR s.securityType != ss.securityType
                       `

  const entries = await sequelize.query(
    `SELECT s.id AS id, ss.id AS idStaged,
            s.uuid AS uuid,
            s.name AS name, ss.name AS nameStaged,
            s.isin AS isin, ss.isin AS isinStaged,
            s.wkn AS wkn, ss.wkn AS wknStaged,
            s.symbolXfra AS symbolXfra, ss.symbolXfra AS symbolXfraStaged,
            s.securityType AS securityType, ss.securityType AS securityTypeStaged
     ${sqlFromWhere}
     ORDER BY ${sort} ${descending ? 'DESC' : 'ASC'}
     LIMIT ${limit} OFFSET ${skip}
    `,
    { type: QueryTypes.SELECT }
  )
  const count = (await sequelize.query(
    `SELECT count(*) AS cnt ${sqlFromWhere}`,
    {
      type: QueryTypes.SELECT,
    }
  )) as Array<{ cnt: number }>

  res.json({ entries, params: { totalCount: count[0].cnt } })
})

/**
 * Get added/removed securities, i.e. securities only/not in staging
 */
router.get('/compare/added-removed', authRequired, async function(
  req: Request,
  res: Response
) {
  const limit = parseInt(req.query.limit) || 10
  const skip = parseInt(req.query.skip) || 0
  const sort = req.query.sort || 'isin'
  const descending = req.query.desc === 'true'

  log(
    `Getting added/removed entries, limit: ${limit}, skip: ${skip}, ` +
      `sort: ${sort}, desc: ${descending}`
  )

  const sqlFromWhere = `FROM securities
                        WHERE (
                          staged = 1 AND
                          uuid IS NULL
                        ) OR (
                          staged = 0 AND
                          uuid NOT IN (SELECT uuid FROM securities WHERE staged = 1 AND uuid IS NOT NULL)
                        )
                       `

  const entries = ((await sequelize.query(
    `SELECT id,
            uuid,
            staged,
            name,
            isin,
            wkn,
            symbolXfra,
            securityType
     ${sqlFromWhere}
     ORDER BY ${sort} ${descending ? 'DESC' : 'ASC'}
     LIMIT ${limit} OFFSET ${skip}
    `,
    { type: QueryTypes.SELECT }
  )) as Array<{
    id: number
    uuid: string
    staged: number
    name: string
    isin: string
    wkn: String
    symbolXfra: string
    securityType: string
    type: string // Not in SQL but will be added soon
  }>).map(e => {
    if (e.staged === 1) {
      e.type = 'added'
    } else {
      e.type = 'removed'
    }
    delete e.staged
    return e
  })

  const count = (await sequelize.query(
    `SELECT count(*) AS cnt ${sqlFromWhere}`,
    {
      type: QueryTypes.SELECT,
    }
  )) as Array<{ cnt: number }>

  res.json({ entries, params: { totalCount: count[0].cnt } })
})

export default router
