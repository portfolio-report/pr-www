import ip2loc from 'ip2location-nodejs'
import Debug from 'debug'
const log = Debug('api:geoip')

let initialized = false

export function init() {
  log('Initializing GeoIP database')

  try {
    ip2loc.IP2Location_init('db/IP2LOCATION-LITE-DB1.IPV6.BIN')
    initialized = true
    log('Initialized GeoIP database')
  } catch (err) {
    log('Could not initalize GeoIP database')
    log(err)
  }
}

export function getCountryFromIp(ip: string): string {
  return initialized ? ip2loc.IP2Location_get_country_short(ip) : ''
}

init()
