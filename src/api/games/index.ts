import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { GameSchema } from '@/models/game.dto'
import { SearchListRequestSchema } from '@/models/search.dto'
import type { Env } from '@/utils/bindings'

const app = new OpenAPIHono<{ Bindings: Env }>()

app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Games'],
    summary: 'Search Game List',
    description: 'Search Game List',
    request: {
      query: SearchListRequestSchema
    },
    responses: {
      200: {
        content: {
          'application/json': {
            // 型の付け方が良くない
            schema: z.array(GameSchema)
          }
        },
        description: '直近の棋譜一覧'
      }
    }
  }),
  async (c) => {
    const result = z.array(GameSchema).safeParse(
      await c.env.PRISMA.game.findMany({
        orderBy: { id: 'desc' },
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
