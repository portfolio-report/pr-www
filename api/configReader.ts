import fs from 'fs'
import nodemailer from 'nodemailer'
import Debug from 'debug'

const log = Debug('pr-www:configReader')

const configFile = './api/config.json'

interface ContactConfig {
  recipientEmailAddress?: string
  nodemailerTransportOptions?: nodemailer.TransportOptions
}

let initialized = false

let contactConfig: ContactConfig

function readConfigFile() {
  try {
    const config = JSON.parse(fs.readFileSync(configFile).toString())

    if (!config.contact) {
      throw new Error('contact object is missing.')
    }
    contactConfig = config.contact
  } catch (err) {
    log('Configuration file api/config.json cannot be read.', err)
    log('Continue with empty config.')

    contactConfig = {}
  }

  initialized = true
}

readConfigFile()

export function getContactConfig(): ContactConfig {
  if (!initialized) {
    readConfigFile()
  }
  return contactConfig
}
