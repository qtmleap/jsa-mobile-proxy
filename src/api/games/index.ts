import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { ListSchema } from '@/models/common'
import { GameRequestQuerySchema, GameSchema } from '@/models/game.dto'
import type { Env } from '@/utils/bindings'

const app = new OpenAPIHono<{ Bindings: Env }>()

app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Games'],
    // middleware: [cache({ cacheName: 'games', cacheControl: 'public, max-age=300' })],
    summary: 'Search Game List',
    description: 'Search Game List',
    request: {
      query: GameRequestQuerySchema
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
    const { page, limit, tournament, player, startTime, endTime } = c.req.valid('query')
    console.log({ page, limit, tournament, player, startTime, endTime })
    const result = ListSchema(GameSchema).safeParse(
      await c.env.PRISMA.game.findMany({
        orderBy: { startTime: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        include: {
          black: true,
          white: true
        },
        where: {
          // ...(startTime || endTime
          //   ? {
          //       startTime: {
          //         ...(startTime && { gte: startTime }),
          //         ...(endTime && { lte: endTime })
          //       }
          //     }
          //   : {}),
          tournament: {
            equals: tournament
          }
          // OR: [{ blackId: player ?? undefined }, { whiteId: player ?? undefined }]
        }
      })
    )
    if (!result.success) {
      console.error(result.error)
      throw result.error
    }
    return c.json(result.data, 200)
  }
)

export default app
