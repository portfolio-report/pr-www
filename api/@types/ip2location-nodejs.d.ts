/* eslint-disable camelcase */
declare module 'ip2location-nodejs' {
  export function IP2Location_init(binpath: string): void

  export function IP2Location_get_country_short(myIP: string): string
}
