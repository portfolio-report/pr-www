/* eslint-disable no-console */

import path from 'node:path'
import process from 'node:process'
import url from 'node:url'
import express from 'express'

const port = process.env.PORT || 4000
const app = express()

const dirname
  = `${path.dirname(url.fileURLToPath(import.meta.url))}/.output/public`

// serve static files
app.use(express.static(dirname))

// fallback to 200.html
app.get('*', (_request, response) => {
  response.sendFile(path.resolve(dirname, '200.html'))
})

app.listen(port)
console.log(`serving static files from ${dirname} started on port ${port}`)
