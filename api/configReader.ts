import fs from 'fs'
import nodemailer from 'nodemailer'
import Debug from 'debug'

const log = Debug('pr-www:configReader')

const configFile = './api/config.json'

interface AdminUser {
  username: string
  password: string
}

function isAdminUsers(arg: any): arg is Array<AdminUser> {
  return (
    arg &&
    Array.isArray(arg) &&
    arg.every(
      (e) =>
        e &&
        e.username &&
        typeof e.username === 'string' &&
        e.password &&
        typeof e.password === 'string'
    )
  )
}

interface ContactConfig {
  recipientEmailAddress?: string
  nodemailerTransportOptions?: nodemailer.TransportOptions
}

let initialized = false

let adminUsers: Array<AdminUser>
let contactConfig: ContactConfig

function readConfigFile() {
  try {
    const config = JSON.parse(fs.readFileSync(configFile).toString())
    if (!isAdminUsers(config.auth.adminUsers)) {
      throw new Error('auth.adminUsers not in expected format.')
    }
    adminUsers = config.auth.adminUsers

    if (!config.contact) {
      throw new Error('contact object is missing.')
    }
    contactConfig = config.contact
  } catch (err) {
    log('Configuration file api/config.json cannot be read.', err)
    log('Continue with empty config.')

    adminUsers = []
    contactConfig = {}
  }

  initialized = true
}

readConfigFile()

export function getAdminUsers(): Array<AdminUser> {
  if (!initialized) {
    readConfigFile()
  }
  return adminUsers
}

export function getContactConfig(): ContactConfig {
  if (!initialized) {
    readConfigFile()
  }
  return contactConfig
}
