/**
 * This server middleware adds session handling using express-session
 * and session store on the server using SQLite.
 */

import session from 'express-session'
import CSS from 'connect-session-sequelize'
import Sequelize from 'sequelize'
import config from '../api/config.js'

const sequelize = new Sequelize('sessions', null, null, {
  dialect: 'sqlite',
  storage: './db/sessions.sqlite',
  logging: false // Don't log every SQL to console
})

const SequelizeStore = CSS(session.Store)

const sequelizeStore = new SequelizeStore({ db: sequelize })

// Initialize database
sequelizeStore.sync()

export default session({
  secret: config.auth.secret,
  name: 'sid',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }, // 1h
  unset: 'destroy',
  store: sequelizeStore
})
