import { PrismaClient } from '@prisma/client'
import Debug from 'debug'

const log = Debug('pr-www:prisma')

export const prisma = new PrismaClient({
  log: [{ emit: 'event', level: 'query' }],
})

prisma.$on('query', (e) => {
  log(`SQL: ${e.query}, params: ${e.params}, duration: ${e.duration}`)
})
