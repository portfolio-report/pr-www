import express from 'express'

const app = express()

app.get('/', function(req, res) {
  res.json({ status: 'ok' })
})

// This has to be the last route!
app.route('*').get(function(req, res) {
  res.status(404).json({ message: 'Page not found.' })
})

export default {
  path: '/api',
  handler: app
}
