/* eslint-disable no-console */
'use strict'

const fs = require('fs')
const path = require('path')
let Promise

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options) {
  Promise = options.Promise
}

exports.up = function (db) {
  const filePath = path.join(
    __dirname,
    'sqls',
    '20210202200000-create-sessions-up.sql'
  )
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
      if (err) return reject(err)
      console.log('received data: ' + data)

      resolve(data)
    })
  }).then(function (data) {
    return db.runSql(data)
  })
}

exports.down = function (db) {
  const filePath = path.join(
    __dirname,
    'sqls',
    '20210202200000-create-sessions-down.sql'
  )
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
      if (err) return reject(err)
      console.log('received data: ' + data)

      resolve(data)
    })
  }).then(function (data) {
    return db.runSql(data)
  })
}

exports._meta = {
  version: 1,
}
