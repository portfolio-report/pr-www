# pr-www

> Portfolio Report Website

## Getting started

``` bash
# Disable conversion of line endings (in Windows)
git config --global core.autocrlf false

# Clone repository
$ git clone ...

# Install dependencies
$ npm install
```

## Configuration

- Create `api/config.json`, e.g.
  ```json
  {
    "auth": {
      "adminUsers": [
        {
          "username": "...",
          "password": "plain:secret"
        },
        {
          "username": "...",
          "password": "sha256:2bb80d53..."
        }
      ]
    },
    "contact": {
      "recipientEmailAddress": "me@example.com",
      "nodemailerTransportOptions": {}
    }
  }
  ```
  - For `nodemailerTransportOptions` see https://nodemailer.com/smtp/, e.g.
    ```json
    {
      host: 'localhost',
      port: 25
    }
    ```
- Environment variable `SESSION_SECRET` should contain unique, random string to sign session ID cookie
- Environment variables `SEARCH_MIN_RESULTS` and `SEARCH_MAX_SCORE` can be used to fine tune search results

## Database

``` bash
# Initialize/update database
$ npm run migrations

# Get status of migrations
$ node_modules\.bin\sequelize-cli db:migrate:status
```

## GeoIP lookups

- Place `IP2LOCATION-LITE-DB1.IPV6.BIN` (from https://lite.ip2location.com) in db folder

## Build Setup

``` bash
# serve with hot reload at localhost:3000
$ npm run dev

# run nuxt in production mode and restart on changes in /api
$ npm run build
$ npm run devapi

# build for production and launch server
$ npm run build
$ npm start
```

## Docker

``` bash
# Create config
$ vim pr-www/api/config.ts

# Build image
$ docker build -t <my-image-name> pr-www/

# Create shared folder
$ mkdir -p shared/www-db-prod

# Run container
$ docker run -d --name pr-www-prod \
  --mount type=bind,source="$(pwd)"/shared/www-db-prod,target=/app/db \
  --mount type=bind,source="$(pwd)"/config.prod.json,target=/app/api/config.json \
  -e SESSION_SECRET=change_me \
  --publish 127.0.0.1:3001:3000 <my-image-name>
```
