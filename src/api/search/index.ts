import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { decodeGameList, importJSA } from '@mito-shogi/tsshogi-jsa'
import { HTTPException } from 'hono/http-exception'
import { exportJKF, type Record } from 'tsshogi'
import { z } from 'zod'
import { SearchListRequestSchema, SearchListResponseSchema } from '@/models/search.dto'
import type { Bindings } from '@/utils/bindings'

const app = new OpenAPIHono<{ Bindings: Bindings }>()

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
    const result = SearchListResponseSchema.safeParse(decodeGameList(Buffer.from(buffer)))
    if (!result.success) {
      throw new HTTPException(400, { message: result.error.message })
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
        action: 'shogi' as const,
        p1: game_id
      }
    })
    const record: Record | Error = importJSA(buffer)
    if (record instanceof Error) {
      throw new HTTPException(400, { message: record.message })
    }
    return c.json(exportJKF(record), 200)
  }
)

export default app
