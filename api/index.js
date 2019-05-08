import express from 'express'
import Debug from 'debug'
import contact from './contact.js'
import currencies from './currencies.js'
import securities from './securities.js'
import stats from './stats.js'
const log = Debug('api:index')

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

/**
 * Return 404 if nothing has matched so far.
 */
app.use(function(req, res, next) {
  const err = new Error('Page not found')
  err.statusCode = 404
  next(err)
})

/**
 * Generic error handler
 */
app.use(function(err, req, res, next) {
  if (!err.statusCode) err.statusCode = 500

  if (err.statusCode >= 500) {
    log(err.stack)
  }

  // Be verbose in development mode
  if (process.env.NODE_ENV !== 'production') {
    return res
      .status(err.statusCode)
      .json({ message: err.message, stack: err.stack })
  }

  res.status(err.statusCode).json({ message: err.message })
})

export default {
  path: '/api',
  handler: app
}
