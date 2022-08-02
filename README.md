# Portfolio Report Website

[![Build status](https://img.shields.io/github/workflow/status/portfolio-report/pr-www/CI?style=flat-square)](https://github.com/portfolio-report/pr-www/actions/workflows/ci.yml)

This repo holds the website [Portfolio Report](https://www.portfolio-report.net/). It provides a user interface to the data provided by the [API](https://github.com/portfolio-report/pr-api).

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
# Use this URL as baseUrl for Axios
API_URL=https://...
```

## Build Setup

``` bash
# serve with hot reload at localhost:3000
$ pnpm dev

# generate files and serve them
$ pnpm generate
$ pnpm start
```
