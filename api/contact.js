import express from 'express'
import nodemailer from 'nodemailer'
import { check, validationResult } from 'express-validator/check'
import Debug from 'debug'
import config from './config.js'
const log = Debug('api:contact')

const router = express.Router()

// Parse JSON payloads
router.use(express.json())

router.get('/', function(req, res) {
  res.json({ status: 'ok' })
})

router.post(
  '/',
  [
    // Validate and sanitize input values
    check('name')
      .isString()
      .isLength({ min: 1 })
      .trim()
      .escape(),
    check('email')
      .isEmail()
      .trim()
      .normalizeEmail(),
    check('subject')
      .isString()
      .isLength({ min: 1 })
      .trim()
      .escape(),
    check('message')
      .isString()
      .isLength({ min: 1 })
      .trim()
  ],
  function(req, res) {
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
      log('Error validating input: ' + JSON.stringify(validationErrors.array()))
      return res.status(400).json({ status: 'error' })
    }

    if (
      !config.contact ||
      !config.contact.recipientEmailAddress ||
      config.contact.recipientEmailAddress === '' ||
      !config.contact.nodemailerTransportOptions ||
      JSON.stringify(config.contact.nodemailerTransportOptions) === '{}'
    ) {
      log('Cannot send email, missing configuration.')
      return res.status(500).json({ status: 'error' })
    }

    nodemailer
      .createTransport(config.contact.nodemailerTransportOptions)
      .sendMail({
        from: `"${req.body.name}" <${req.body.email}>`,
        to: config.contact.recipientEmailAddress,
        subject: 'Message via www.portfolio-report.net: ' + req.body.subject,
        text: req.body.message + '\n\nRemote IP: ' + req.ip
      })
      .then(info => {
        log('Email sent: ' + JSON.stringify(info))
        res.json({ status: 'ok' })
      })
      .catch(err => {
        log('Error sending email: ' + JSON.stringify(err))
        res.status(500).json({ status: 'error' })
      })
  }
)

export default router
