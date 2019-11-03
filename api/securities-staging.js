import express from 'express'
import bodyParser from 'body-parser'
import Debug from 'debug'
import { authRequired } from './auth.js'
import { Security } from './inc/sequelize.js'
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

export default router
