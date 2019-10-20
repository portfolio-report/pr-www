// Transpile with babel
require('@babel/register')({
  presets: ['@babel/preset-env'],
})

require('../api/inc/sync-db.js')
