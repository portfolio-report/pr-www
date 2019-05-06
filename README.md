# pr-www

> Portfolio Report Website

## Getting started

``` bash
# Clone repository
$ git clone ...

# Install dependencies
$ npm install
```

## Configuration

- Update `api/config.js`

## Build Setup

``` bash
# serve with hot reload at localhost:3000
$ npm run dev
# Unfortunately changes in /api force a full server restart (https://github.com/nuxt/nuxt.js/issues/4301)
# Workaround: fast server restart on changes in /api without nuxt reload
$ npm run build
$ npm run devapi

# build for production and launch server
$ npm run build
$ npm start
```

## Docker

``` bash
# Use API_URL to override Axios BaseURL
$ BASE_URL=http://www.example.com/

# Build image
$ docker build -t <my-image-name> --build-arg API_URL=$API_URL pr-www/

# Create shared folder
$ mkdir -p shared/www-db-prod

# Create config
$ vim shared/config-prod.js

# Run container
$ docker run -d --name pr-www-prod \
  --volume "$(pwd)"/shared/www-db-prod:/app/db \
  --volume "$(pwd)"/shared/config-prod.js:/app/api/config.js \
  -e BASE_URL=https://www.example.com/ \
  --publish 127.0.0.1:3001:3000 <my-image-name>
```
