import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { cache } from 'hono/cache'
import { HTTPException } from 'hono/http-exception'
import { exportJKF, importJKFString, type Record } from 'tsshogi'
import { authJWT } from '@/middleware/auth'
import { ListSchema } from '@/models/common.dto'
import { GameRequestParamsSchema, GameRequestQuerySchema, GameSchema } from '@/models/game.dto'
import { JKFSchema } from '@/models/jkf.dto'
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
    middleware: [
      cache({
        cacheName: 'games',
        wait: true,
        cacheControl: 'public, s-maxage=300, max-age=0, stale-while-revalidate=60, stale-if-error=86400',
        // cacheControl: 'public, max-age=0',
        keyGenerator: (c) => {
          return c.req.url
        }
      }),
      authJWT
    ],
    summary: 'Search Game List',
    description: 'Search Game List',
    request: {
      query: GameRequestQuerySchema
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z
              .object({
                results: z.array(GameSchema),
                count: z.number().int().nonnegative(),
                page: z.number().int().positive(),
                limit: z.number().int().positive()
              })
              .openapi('PaginatedGameList')
          }
        },
        description: '直近の棋譜一覧'
      }
    }
  }),
  async (c) => {
    const { page, limit, tournament, startTime, endTime, player } = c.req.valid('query')

    // 共通のwhere条件
    const condition = {
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

    // データと総件数を並行取得
    const [games, count] = await Promise.all([
      c.env.PRISMA.game.findMany({
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
        where: condition
      }),
      c.env.PRISMA.game.count({
        where: condition
      })
    ])

    const result = ListSchema(GameSchema).safeParse(
      games.map((game) => ({ ...game, tags: game.tags.map((tag) => tag.name) }))
    )
    if (!result.success) {
      throw result.error
    }

    return c.json(
      {
        results: result.data,
        count: count,
        page: page,
        limit: limit
      },
      200
    )
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
    const game = await c.env.PRISMA.game.findUniqueOrThrow({
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
        kif: true,
        tags: true
      }
    })
    if (game.kif === null) {
      const result = GameSchema.safeParse({
        ...game,
        kif: null,
        tags: game.tags.map((tag) => tag.name)
      })
      if (!result.success) {
        throw result.error
      }
      return c.json(result.data, 200)
    }
    const record: Record | Error = importJKFString(game.kif)
    if (record instanceof Error) {
      throw new HTTPException(500, { message: 'Failed to parse KIF data' })
    }
    const result = GameSchema.safeParse({
      ...game,
      kif: JKFSchema.parse(exportJKF(record)),
      tags: game.tags.map((tag) => tag.name)
    })
    if (!result.success) {
      throw result.error
    }
    return c.json(result.data, 200)
  }
)

export default app
