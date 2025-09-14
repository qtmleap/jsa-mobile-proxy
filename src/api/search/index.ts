import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { decodeGameList, decodeJSA, importJSA } from '@mito-shogi/tsshogi-jsa'
import { HTTPException } from 'hono/http-exception'
import { exportJKF, type Record } from 'tsshogi'
import { z } from 'zod'
import { SearchListRequestSchema, SearchListResponseSchema } from '@/models/search.dto'
import type { Env } from '@/utils/bindings'
import { upsertGame, upsertGameInfo } from '@/utils/prisma'

const app = new OpenAPIHono<{ Bindings: Env }>()

app.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['Search'],
    summary: 'Search KIF List',
    description: 'Search',
    request: {
      query: SearchListRequestSchema
    },
    responses: {
      200: {
        content: {
          'application/json': {
            // 型の付け方が良くない
            schema: SearchListResponseSchema
          }
        },
        description: '直近の棋譜一覧'
      }
    }
  }),
  async (c) => {
    const { p1, p2, p3 } = c.req.valid('query')
    const buffer = await c.env.CLIENT.get('/api/index.php', {
      queries: {
        // @ts-ignore
        action: 'search',
        p1,
        p2,
        p3
      }
    })
    const { games } = decodeGameList(Buffer.from(buffer))
    console.log(games)
    c.executionCtx.waitUntil(Promise.all(games.map((game) => upsertGame(c.env, game))))
    const result = SearchListResponseSchema.safeParse({ games, count: games.length })
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
    tags: ['Search'],
    summary: 'Search KIF',
    description: 'Search',
    request: {
      params: z.object({
        game_id: z.coerce.number().int().default(100)
      })
    },
    responses: {
      200: {
        content: {
          'application/json': {
            // 型の付け方が良くない
            schema: z.object({})
          }
        },
        description: 'JKF形式の棋譜データ'
      }
    }
  }),
  async (c) => {
    const { game_id } = c.req.valid('param')
    const buffer = await c.env.CLIENT.get('/api/index.php', {
      queries: {
        // @ts-ignore
        action: 'shogi',
        p1: game_id
      }
    })
    const record: Record | Error = importJSA(buffer)
    if (record instanceof Error) {
      throw new HTTPException(400, { message: record.message })
    }
    await upsertGameInfo(c.env, decodeJSA(buffer), record)
    return c.json(exportJKF(record), 200)
  }
)

export default app
