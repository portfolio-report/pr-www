/**
 * This server middleware adds session handling using express-session
 * and session store on the server using Prisma.
 */

import session from 'express-session'
import { PrismaSessionStore } from '@quixo3/prisma-session-store'
import { prisma } from '../api/inc/prisma'

const store = new PrismaSessionStore(prisma, {
  checkPeriod: 10 * 60 * 1000, // 10min
  dbRecordIdIsSessionId: true,
})

export default session({
  secret: process.env.SESSION_SECRET || Math.random().toString(36).substr(2),
  name: 'sid',
  resave: false,
  saveUninitialized: false,
  unset: 'destroy',
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1d
  },
  store,
})
