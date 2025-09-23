import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import type { JwtVariables } from 'hono/jwt'
import { ListSchema } from '@/models/common.dto'
import { PlayerRequestQuerySchema, PlayerSchema } from '@/models/player.dto'
import type { Env } from '@/utils/bindings'

const app = new OpenAPIHono<{ Bindings: Env; Variables: JwtVariables }>()

app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Players'],
    // middleware: [cache({ cacheName: 'players', cacheControl: 'public, max-age=86400' })],
    summary: 'Search Player List',
    description: 'Search Player List',
    request: {
      query: PlayerRequestQuerySchema
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z
              .object({
                results: z.array(PlayerSchema),
                count: z.number().int().nonnegative(),
                page: z.number().int().positive(),
                limit: z.number().int().positive()
              })
              .openapi('PaginatedPlayerList')
          }
        },
        description: 'プレイヤー一覧'
      }
    }
  }),
  async (c) => {
    const { page, limit } = c.req.valid('query')

    // データと総件数を並行取得
    const players = await c.env.PRISMA.player.findMany({
      orderBy: { name: 'asc' },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        _count: {
          select: {
            blackGames: true,
            whiteGames: true
          }
        }
      }
    })

    const result = ListSchema(PlayerSchema).safeParse(
      players
        .map((player) => ({
          name: player.name,
          count: player._count.blackGames + player._count.whiteGames
        }))
        .filter((player) => player.count >= 1)
        .sort((a, b) => b.count - a.count)
    )
    if (!result.success) {
      throw new HTTPException(500, { message: result.error.message })
    }

    return c.json(
      {
        results: result.data,
        count: result.data.length,
        page: page,
        limit: limit
      },
      200
    )
  }
)

export default app
