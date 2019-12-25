import { sequelize } from './sequelize.js'

// eslint-disable-next-line no-console
const log = console.log

log('Creating/updating db definition...')

sequelize
  .sync({ alter: true })
  .then(() => {
    log('done.')
    return true
  })
  .catch(err => {
    log(err)
    process.exit(1)
  })
