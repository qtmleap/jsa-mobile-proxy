import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
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
        take: 100
      })
    )
    if (!result.success) {
      throw new HTTPException(500, { message: result.error.message })
    }
    return c.json(result.data, 200)
  }
)

export default app
