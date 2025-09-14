import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { authJWT } from '@/middleware/auth'
import { ListSchema } from '@/models/common'
import { GameRequestParamsSchema, GameRequestQuerySchema, GameSchema } from '@/models/game.dto'
import type { Env } from '@/utils/bindings'

const app = new OpenAPIHono<{ Bindings: Env }>({
  defaultHook: (result) => {
    if (!result.success) {
      throw result.error
    }
  }
})

app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Games'],
    middleware: [authJWT],
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
    const { page, limit, tournament, startTime, endTime, player } = c.req.valid('query')
    const result = ListSchema(GameSchema).safeParse(
      await c.env.PRISMA.game.findMany({
        orderBy: { startTime: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        select: {
          id: true,
          moves: true,
          title: true,
          startTime: true,
          endTime: true,
          blackId: true,
          whiteId: true,
          timeLimit: true,
          tournament: true,
          location: true,
          tags: true
        },
        where: {
          ...(startTime || endTime
            ? {
                startTime: {
                  ...(startTime && { gte: startTime }),
                  ...(endTime && { lte: endTime })
                }
              }
            : {}),
          tournament: {
            equals: tournament
          },
          ...(player
            ? {
                OR: [{ blackId: player }, { whiteId: player }]
              }
            : {})
        }
      })
    )
    if (!result.success) {
      throw result.error
    }
    return c.json(result.data, 200)
  }
)

app.openapi(
  createRoute({
    method: 'get',
    path: '/:game_id',
    tags: ['Games'],
    middleware: [authJWT],
    summary: 'Get Game Details',
    description: 'Get Game Details',
    request: {
      params: GameRequestParamsSchema
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: GameSchema
          }
        },
        description: '対局詳細'
      }
    }
  }),
  async (c) => {
    const { game_id } = c.req.valid('param')
    console.log(game_id)
    const result = GameSchema.safeParse(
      await c.env.PRISMA.game.findUniqueOrThrow({
        where: { id: game_id },
        select: {
          id: true,
          moves: true,
          title: true,
          startTime: true,
          endTime: true,
          blackId: true,
          whiteId: true,
          timeLimit: true,
          tournament: true,
          location: true,
          kif: c.env.IS_PREMIUM,
          tags: true
        }
      })
    )
    if (!result.success) {
      throw result.error
    }
    return c.json(result.data, 200)
  }
)

export default app
