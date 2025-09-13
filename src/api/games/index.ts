import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { cache } from 'hono/cache'
import { HTTPException } from 'hono/http-exception'
import { ListSchema } from '@/models/common'
import { GameSchema } from '@/models/game.dto'
import type { Env } from '@/utils/bindings'

const app = new OpenAPIHono<{ Bindings: Env }>()

app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Games'],
    middleware: [cache({ cacheName: 'games', cacheControl: 'public, max-age=300' })],
    summary: 'Search Game List',
    description: 'Search Game List',
    request: {
      // query: SearchListRequestSchema
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: ListSchema(GameSchema)
          }
        },
        description: '直近の棋譜一覧'
      }
    }
  }),
  async (c) => {
    const result = ListSchema(GameSchema).safeParse(
      await c.env.PRISMA.game.findMany({
        orderBy: { startTime: 'desc' },
        take: 100,
        include: {
          black: true,
          white: true
        }
      })
    )
    if (!result.success) {
      throw new HTTPException(500, { message: result.error.message })
    }
    return c.json(result.data, 200)
  }
)

export default app
