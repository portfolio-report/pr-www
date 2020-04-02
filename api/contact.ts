import util from 'util'
import express, { Request, Response } from 'express'
import nodemailer from 'nodemailer'
import { check, validationResult } from 'express-validator'
import Debug from 'debug'
import config from './config'
const log = Debug('pr-www:contact')

const router = express.Router()

// Parse JSON payloads
router.use(express.json())

router.get('/', function(_req: Request, res: Response) {
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
      .trim(),
  ],
  async function(req: Request, res: Response) {
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
      log('Error validating input: ' + util.inspect(validationErrors.array()))
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

    try {
      const info = await nodemailer
        .createTransport(config.contact.nodemailerTransportOptions)
        .sendMail({
          from: `"${req.body.name}" <${req.body.email}>`,
          to: config.contact.recipientEmailAddress,
          headers: { 'X-Remote-IP': req.ip },
          subject: 'Message via www.portfolio-report.net: ' + req.body.subject,
          text: req.body.message,
        })

      log('Email sent: ' + util.inspect(info))
      res.json({ status: 'ok' })
    } catch (err) {
      log('Error sending email: ' + util.inspect(err))
      res.status(500).json({ status: 'error' })
    }
  }
)

export default router
