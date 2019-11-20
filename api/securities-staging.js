import express from 'express'
import bodyParser from 'body-parser'
import Debug from 'debug'
import { authRequired } from './auth.js'
import { sequelize, Security } from './inc/sequelize.js'
const log = Debug('api:securities-staging')

const router = express.Router()

// Parse (large) text/plain payload
router.use(bodyParser.text({ limit: '50mb' }))

// Parse (large) JSON payloads
router.use(express.json({ limit: '20mb' }))

/**
 * Create entries, i.e. staged securities
 */
router.post('/', authRequired, async function(req, res, next) {
  if (req.query.sourceFormat === undefined) {
    // expect format like in GET operations (json)

    const err = new Error('not implemented')
    err.statusCode = 500
    return next(err)
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

    // Only accept MIC XFRA (Frankfurt) or empty (indexes)
    data = data.filter(
      line =>
        line[headers.indexOf('MIC Code')] === 'XFRA' ||
        line[headers.indexOf('MIC Code')] === ''
    )

    // Convert data lines to objects
    const entries = data.map(line => {
      const security = {}
      security.staged = true
      security.name = line[headers.indexOf('Instrument')]
      security.isin = line[headers.indexOf('ISIN')]
      security.wkn = line[headers.indexOf('WKN')].slice(-6) // Only last 6 digits,
      security.symbolXfra = line[headers.indexOf('Mnemonic')]

      /* Infer securityType from Instrument Group */
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
          security.securityType = name
        }
      }

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
router.delete('/', authRequired, async function(req, res) {
  const count = await Security.destroy({ where: { staged: true } })
  log(`Deleted ${count} entries`)
  res.send()
})

router.get('/stats', authRequired, async function(req, res) {
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
    duplicateIsins[staged] = await sequelize
      .query(
        `SELECT isin FROM securities WHERE staged = :staged GROUP BY isin HAVING COUNT(*) > 1`,
        { type: sequelize.QueryTypes.SELECT, replacements: { staged } }
      )
      .map(e => e.isin)
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
 * Match staged with unstaged securities based on ISIN
 */
router.post('/match/isin', authRequired, async function(req, res, next) {
  // Take over UUID from securities with matching ISIN
  await sequelize.query(
    `UPDATE securities
     SET
      uuid = (SELECT s2.uuid FROM securities s2
              WHERE s2.staged = 0
                AND s2.isin = securities.isin
             )
    WHERE uuid IS NULL
      AND staged = 1
      /* (Redundant) check to only copy from securities with unique key fields */
      AND 1 = (SELECT COUNT(*) FROM securities s2
               WHERE s2.staged = 0
                 AND s2.isin = securities.isin
              )
      /* (Redundant) check to only apply on staged securities with unique key fields */
      AND 1 = (SELECT COUNT(*) FROM securities s2
               WHERE s2.staged = 1
                 AND s2.isin = securities.isin
              )
    `
  )

  res.json({ status: 'ok' })
})

/**
 * Get all changes comparing staged and unstaged security (with same UUID)
 */
router.get('/compare/changes', authRequired, async function(req, res) {
  const limit = parseInt(req.query.limit) || 10
  const skip = parseInt(req.query.skip) || 0
  const sort = req.query.sort || 'uuid'
  const descending = req.query.desc === 'true'

  log(
    `Getting entries, limit: ${limit}, skip: ${skip}, ` +
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
    { type: sequelize.QueryTypes.SELECT }
  )
  const count = await sequelize.query(
    `SELECT count(*) AS cnt ${sqlFromWhere}`,
    {
      type: sequelize.QueryTypes.SELECT,
    }
  )

  res.json({ entries, params: { totalCount: count[0].cnt } })
})

export default router
