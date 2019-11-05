import { promises as fs } from 'fs'
import path from 'path'
import express from 'express'
import Debug from 'debug'
import { authRequired } from './auth.js'
import { Security, ClientUpdate } from './inc/sequelize.js'

const log = Debug('api:backups')

const router = express.Router()
export default router

const backupPath = path.resolve('db/backups/')

/**
 * List all backups
 */
router.get('/', authRequired, async function(req, res) {
  await fs.mkdir(backupPath, { recursive: true })

  const fileNames = await fs.readdir(backupPath)
  const files = []
  for (const fileName of fileNames) {
    const stats = await fs.stat(path.join(backupPath, fileName))
    files.push({
      name: fileName,
      size: stats.size,
    })
  }

  res.json(files)
})

/**
 * Create backups
 */
router.post('/', authRequired, async function(req, res) {
  await fs.mkdir(backupPath, { recursive: true })

  const timestamp = new Date().toISOString().replace(/:/g, '_')

  for (const Table of [ClientUpdate, Security]) {
    const result = await Table.findAndCountAll()

    const fileName = `backup-${Table.name}-${timestamp}.json`
    await fs.writeFile(
      path.join(backupPath, fileName),
      JSON.stringify({
        entries: result.rows,
        totalCount: result.count,
        table: Table.name,
      })
    )
  }

  res.json({ status: 'ok' })
})

/**
 * Middleware to check if file exists and store full file path in request
 */
router.use('/:file', authRequired, async function(req, res, next) {
  req.filePath = path.join(backupPath, req.params.file)
  try {
    await fs.stat(req.filePath)
  } catch (e) {
    return res.status(404).json({ message: 'Backup not found.' })
  }
  next()
})

/**
 * Download backup
 */
router.get('/:file', authRequired, function(req, res) {
  res.download(req.filePath)
})

/**
 * Restore backup
 */
router.post('/:file/restore', authRequired, async function(req, res, next) {
  log(`Restoring ${req.filePath}...`)
  const fileContent = await fs.readFile(req.filePath)
  const backup = JSON.parse(fileContent)

  log(`Table: ${backup.table}`)
  log(`Entries: ${backup.totalCount}`)

  let Table
  if (backup.table === 'clientUpdate') Table = ClientUpdate
  else if (backup.table === 'security') Table = Security
  else {
    const err = new Error(`Unknown backup table "${backup.table}"`)
    err.statusCode = 400
    return next(err)
  }

  const deleteCount = await Table.destroy({ truncate: true })
  log(`Deleted ${deleteCount} entries`)

  const createResult = await Table.bulkCreate(backup.entries)
  log(`Created ${createResult.length} entries`)

  res.json({ status: 'ok' })
})

/**
 * Delete backup
 */
router.delete('/:file', authRequired, async function(req, res) {
  await fs.unlink(req.filePath)
  res.json({ status: 'ok' })
})
