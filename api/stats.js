import express from 'express'
import NeDB from 'nedb'
import geoip from 'geoip-lite'

const db = new NeDB({
  filename: './db/stats.db.json',
  autoload: true
})

const router = express.Router()

router.route('/').get(function(req, res) {
  db.find({ type: 'update' }, function(err, updates) {
    if (err) {
      res.send(err)
    }

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
})

router.route('/update/:package/:version').get(function(req, res) {
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
  db.insert(logLine)

  // Send answer to client
  res.send('ok')
})

export default router
