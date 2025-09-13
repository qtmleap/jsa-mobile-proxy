import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { cache } from 'hono/cache'
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
    middleware: [cache({ cacheName: 'players', cacheControl: 'public, max-age=86400' })],
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
        include: {
          _count: {
            select: {
              blackGames: true,
              whiteGames: true
            }
          }
        }
      })
    )
    if (!result.success) {
      throw new HTTPException(500, { message: result.error.message })
    }
    return c.json(
      result.data.filter((result) => result.count >= 5).sort((a, b) => b.count - a.count),
      200
    )
  }
)

export default app
