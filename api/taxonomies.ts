import Debug from 'debug'
import express, { NextFunction, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import { authRequired } from './auth'
import { HttpError } from './inc/HttpError'
import { prisma } from './inc/prisma'
import { createUuid } from './inc/uuid'
const log = Debug('pr-www:taxonomies')

const router = express.Router()

// Parse JSON payloads
router.use(express.json())

/**
 * Get all taxonomies
 */
router.get('/', async function (_req: Request, res: Response) {
  const result = await prisma.taxonomy.findMany()
  return res.json(result)
})

/**
 * Get single taxonomy with all descendants
 */
router.get('/:uuid', async function (req: Request, res: Response) {
  const uuid = req.params.uuid

  const taxonomy = await prisma.taxonomy.findUnique({
    where: { uuid },
    include: { descendants: true },
  })

  return res.json(taxonomy)
})

/**
 * Create taxonomy
 */
router.post(
  '/',
  authRequired,
  async function (req: Request, res: Response, next: NextFunction) {
    const parentUuid = req.body.parentUuid || null

    const data: Prisma.TaxonomyCreateInput = {
      uuid: createUuid(),
      name: req.body.name,
    }

    if (parentUuid) {
      const parent = await prisma.taxonomy.findUnique({
        where: { uuid: parentUuid },
      })
      if (!parent) {
        return next(new HttpError(400, 'parentUuid invalid'))
      }

      data.parent = { connect: { uuid: parent.uuid } }
      data.root = { connect: { uuid: parent.rootUuid || parent.uuid } }
    }

    log(`Creating ${data.uuid}`)
    const taxonomy = await prisma.taxonomy.create({ data })
    res.json(taxonomy)
  }
)

/**
 * Update taxonomy
 */
router.patch(
  '/:uuid',
  authRequired,
  async function (req: Request, res: Response, next: NextFunction) {
    const uuid = req.params.uuid

    const data: Prisma.TaxonomyUpdateInput = {}

    if (req.body.name) {
      data.name = req.body.name
    }

    if (req.body.code) {
      data.code = req.body.code
    }

    if (req.body.parentUuid) {
      const parent = await prisma.taxonomy.findUnique({
        where: { uuid: req.body.parentUuid },
      })
      if (!parent) {
        return next(new HttpError(400, 'parentUuid invalid'))
      }

      if (parent.uuid.replace(/-/g, '') === uuid.replace(/-/g, '')) {
        return next(
          new HttpError(400, 'parentUuid must be different from own uuid')
        )
      }

      data.parent = { connect: { uuid: parent.uuid } }
      data.root = { connect: { uuid: parent.rootUuid || parent.uuid } }
    }

    log(`Updating ${uuid}`)
    const taxonomy = await prisma.taxonomy.update({
      where: { uuid },
      data,
    })

    return res.json(taxonomy)
  }
)

/**
 * Delete taxonomy
 */
router.delete(
  '/:uuid',
  authRequired,
  async function (req: Request, res: Response) {
    const uuid = req.params.uuid

    log(`Deleting ${uuid}`)
    const taxonomy = await prisma.taxonomy.delete({ where: { uuid } })
    res.json(taxonomy)
  }
)

export default router
