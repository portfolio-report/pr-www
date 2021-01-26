# pr-www

> Portfolio Report Website

## Getting started

```bash
# Clone repository
$ git clone ...

# Install dependencies
$ yarn install --frozen-lockfile
```

## Configuration

Create `.env` configuration file or respective environment variables:
```ini
# PostgreSQL database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Random string to sign session ID cookie (optional, highly recommended)
SESSION_SECRET="..."

# Minimum number of search results shown (optional)
SEARCH_MIN_RESULTS=10

# Maximum score of search results shown (optional)
SEARCH_MAX_SCORE=0.1
```

Create `api/config.json`, e.g.:
```json
{
  "contact": {
    "recipientEmailAddress": "me@example.com",
    "nodemailerTransportOptions": {}
  }
}
```
For `nodemailerTransportOptions` see https://nodemailer.com/smtp/, e.g.
```json
{
  "host": "localhost",
  "port": 25
}
```

## Database

``` bash
# Initialize/update database
$ yarn migrate up

# Generate prisma client
$ npx prisma generate

# Create user in database
$ npx prisma studio
# or
$ psql "$DATABASE_URL" -c "INSERT INTO users (username, password) VALUES ('admin','plain:secret')"
# password can be 'plain:...' or 'sha256:2bb80d53...'
```

## GeoIP lookups

- Place `IP2LOCATION-LITE-DB1.IPV6.BIN` (from https://lite.ip2location.com) in db folder

## Build Setup

``` bash
# serve with hot reload at localhost:3000
$ yarn dev

# run nuxt in production mode and restart on changes in /api
$ yarn build
$ yarn devapi

# build for production and launch server
$ yarn build
$ yarn start
```

## Docker

``` bash
# Create config
$ vim pr-www/api/config.json

# Build image
$ docker build -t <my-image-name> pr-www/

# Create shared folder
$ mkdir -p shared/www-db-prod

# Run container
$ docker run -d --name pr-www-prod \
  --mount type=bind,source="$(pwd)"/shared/www-db-prod,target=/app/db \
  --mount type=bind,source="$(pwd)"/config.prod.json,target=/app/api/config.json \
  -e SESSION_SECRET=change_me \
  -e DATABASE_URL="postgresql://..." \
  --publish 127.0.0.1:3001:3000 <my-image-name>
```
