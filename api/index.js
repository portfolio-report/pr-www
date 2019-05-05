import express from 'express'
import contact from './contact.js'
import currencies from './currencies.js'
import securities from './securities.js'
import stats from './stats.js'

const app = express()

/**
 * Remove header X-Powered-By: express
 */
app.disable('x-powered-by')

/**
 * Prettify JSON output
 */
app.set('json spaces', 2)

/**
 * Trust reverse proxy (e.g. use IP address from X-Forwarded-For)
 */
app.set('trust proxy', true)

app.get('/', function(req, res) {
  res.json({ status: 'ok' })
})

app.use('/contact', contact)
app.use('/currencies', currencies)
app.use('/securities', securities)
app.use('/stats', stats)

// This has to be the last route!
app.route('*').get(function(req, res) {
  res.status(404).json({ message: 'Page not found.' })
})

export default {
  path: '/api',
  handler: app
}
