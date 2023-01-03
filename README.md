# Portfolio Report Website

![Language](https://img.shields.io/github/languages/top/portfolio-report/pr-www?style=flat-square) [![Build status](https://img.shields.io/github/actions/workflow/status/portfolio-report/pr-www/ci.yml?style=flat-square)](https://github.com/portfolio-report/pr-www/actions/workflows/ci.yml) [![Website status](https://img.shields.io/website?style=flat-square&url=https%3A%2F%2Fwww.portfolio-report.net)](https://www.portfolio-report.net/)

This repo holds the website [Portfolio Report](https://www.portfolio-report.net/). It provides a user interface to the data provided by the API.

Please use the [discussion forum](https://forum.portfolio-performance.info/) to get help and discuss improvements.

## Getting started

Prerequisites:

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation)

```bash
# Clone repository
$ git clone ...

# Install dependencies
$ pnpm install --frozen-lockfile
```

## Configuration

Create `.env` configuration file or respective environment variables:

```ini
# Use this URL as baseUrl for API requests
API_URL=https://...
```

## Build Setup

``` bash
# serve with hot reload at localhost:3000
$ pnpm dev

# generate static files and serve them
$ pnpm generate
$ pnpm start
```
