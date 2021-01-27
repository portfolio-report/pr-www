import Debug from 'debug'
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'

import auth from './auth'
import contact from './contact'
import currencies from './currencies'
import exchangerates from './exchangerates'
import securities from './securities'
import stats from './stats'
import { HttpError } from './inc/HttpError'
const log = Debug('pr-www:index')

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

/**
 * Allow all CORS requests
 */
app.use(cors())

app.get('/', function (_req, res) {
  res.json({ status: 'ok' })
})

app.use('/auth', auth)
app.use('/contact', contact)
app.use('/currencies', currencies)
app.use('/exchangerates', exchangerates)
app.use('/securities', securities)
app.use('/stats', stats)

/**
 * Return 404 if nothing has matched so far.
 */
app.use(function (_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, 'Page not found'))
})

/**
 * Generic error handler
 */
app.use(function (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status || 500

  if (status >= 500) {
    log(err.stack)
  }

  // Be verbose in development mode
  if (process.env.NODE_ENV !== 'production') {
    return res.status(status).json({ message: err.message, stack: err.stack })
  }

  res.status(err.status).json({ message: err.message })
})

export default {
  path: '/api',
  handler: app,
}
