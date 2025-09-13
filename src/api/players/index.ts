import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { ListSchema } from '@/models/common'
import { PlayerSchema } from '@/models/player.dto'
import type { Env } from '@/utils/bindings'

const app = new OpenAPIHono<{ Bindings: Env }>()

app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Players'],
    summary: 'Search Player List',
    description: 'Search Player List',
    request: {
      // query: SearchListRequestSchema
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: ListSchema(PlayerSchema)
          }
        },
        description: 'プレイヤー一覧'
      }
    }
  }),
  async (c) => {
    const result = ListSchema(PlayerSchema).safeParse(
      await c.env.PRISMA.player.findMany({
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
