import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { cache } from 'hono/cache'
import { HTTPException } from 'hono/http-exception'
import { ListSchema } from '@/models/common'
import { TagSchema } from '@/models/tag.dto'
import type { Env } from '@/utils/bindings'

const app = new OpenAPIHono<{ Bindings: Env }>()

app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Tags'],
    middleware: [cache({ cacheName: 'tags', cacheControl: 'public, max-age=86400' })],
    summary: 'Search Tag List',
    description: 'Search Tag List',
    request: {
      // query: SearchListRequestSchema
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: ListSchema(TagSchema)
          }
        },
        description: 'タグ一覧'
      }
    }
  }),
  async (c) => {
    const result = ListSchema(TagSchema).safeParse(
      await c.env.PRISMA.tag.findMany({
        orderBy: { name: 'desc' },
        take: 100,
        include: {
          _count: {
            select: {
              games: true
            }
          }
        }
      })
    )
    if (!result.success) {
      throw new HTTPException(500, { message: result.error.message })
    }
    return c.json(
      result.data.filter((result) => result.count >= 5).sort((a, b) => a.count - b.count),
      200
    )
  }
)

export default app
