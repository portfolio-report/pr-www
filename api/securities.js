import express from 'express'
import NeDB from 'nedb-promises'

const db = NeDB.create({
  filename: './db/securities.db.json',
  autoload: true
})

const router = express.Router()

router.get('/', function(req, res) {
  res.json({ status: 'ok' })
})

router.route('/:uuid').get(async function(req, res) {
  const uuid = req.params.uuid

  const security = await db.findOne({
    uuid: uuid
  })
  if (!security) {
    res.status(404).json({ message: 'Security not found.' })
    return
  }

  // Hide internal ID
  security._id = undefined

  res.json(security)
})

router.route('/search/:search').get(async function(req, res) {
  const search = req.params.search
  const paramType = req.query.type

  const typeCondition = paramType ? { security_type: paramType } : {}

  const regexStartIMatch = new RegExp('^' + search, 'i')
  const regexExactIMatch = new RegExp('^' + search + '$', 'i')

  const docs = await db
    .find({
      $and: [
        {
          $or: [
            { name: { $regex: regexStartIMatch } },
            { isin: { $regex: regexExactIMatch } },
            { wkn: { $regex: regexExactIMatch } },
            { 'markets.XFRA.symbol': { $regex: regexExactIMatch } },
            { 'markets.XNAS.symbol': { $regex: regexExactIMatch } },
            { 'markets.XNYS.symbol': { $regex: regexExactIMatch } }
          ]
        },
        typeCondition
      ]
    })
    .limit(10)

  // Hide internal IDs
  docs.forEach(doc => {
    doc._id = undefined
  })

  res.json(docs)
})

export default router
