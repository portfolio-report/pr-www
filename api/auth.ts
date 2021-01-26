import crypto from 'crypto'
import express, { NextFunction, Request, Response } from 'express'
import Debug from 'debug'
import { HttpError } from './inc/HttpError'
import { prisma } from './inc/prisma'

const log = Debug('pr-www:auth')

const router = express.Router()

// Parse JSON payloads
router.use(express.json())

declare module 'express-session' {
  interface SessionData {
    user?: { username: string }
  }
}

/**
 * Check credentials and create session
 */
router.post(
  '/login',
  async function (req: Request, res: Response, next: NextFunction) {
    const { username, password } = req.body

    if (
      username === undefined ||
      password === undefined ||
      username === '' ||
      password === ''
    ) {
      log(`Username or password missing.`)
      return next(new HttpError(401, 'Unauthorized'))
    }

    const adminUser = await prisma.user.findFirst({ where: { username } })

    if (!adminUser) {
      log(`User ${username} unknown`)

      return next(new HttpError(401, 'Unauthorized'))
    }

    const passwordHash = adminUser.password

    let passwordCompare: string
    if (passwordHash?.startsWith('plain:')) {
      passwordCompare = 'plain:' + password
    } else if (passwordHash?.startsWith('sha256:')) {
      passwordCompare =
        'sha256:' + crypto.createHash('sha256').update(password).digest('hex')
    } else {
      log(`Password for ${username} uses unknown cipher`)
      return next(new HttpError(401, 'Unauthorized'))
    }

    if (passwordCompare === passwordHash) {
      log(`Creating session for ${username}`)

      const user = { username }

      // Store user in session
      if (req.session) {
        req.session.user = user
      }

      // Return user back to client
      res.json(user)
    } else {
      log(`Invalid password for ${username}`)
      return next(new HttpError(401, 'Unauthorized'))
    }
  }
)

/**
 * Express middleware function to protect api requests from unauthenticated access
 */
export const authRequired = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // If the user is not authenticated
  if (!isAuthenticated(req)) {
    return next(new HttpError(401, 'Unauthorized'))
  }
  next()
}

/**
 * Determine if a request is authenticated
 */
export const isAuthenticated = (req: Request) => {
  return req.session && req.session.user
}

/**
 * Show details about the user from the session
 */
router.get('/me', authRequired, function (req: Request, res: Response) {
  return res.json(req.session?.user)
})

/**
 * Destroy session
 */
router.post('/logout', authRequired, function (req: Request, res: Response) {
  log(`Destroying session for '${req.session?.user?.username}'`)

  // Remove the session
  req.session.destroy(() => {
    res.json({ status: 'ok' })
  })
})

/**
 * List all sessions, session IDs are sensitive!
 */
router.get('/sessions', authRequired, async (req: Request, res: Response) => {
  const sessions = await (req as any).sessionStore.sessionModel.findAll()
  sessions.map((e: any) => {
    e.data = JSON.parse(e.dataValues.data)
    return e
  })

  res.json(sessions)
})

export default router
