import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { MeijinListSchema } from '@/models/meijin-list.dto'
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
    tags: ['Meijin'],
    middleware: [],
    summary: 'Search Game List',
    description: 'Search Game List',
    request: {},
    responses: {
      200: {
        content: {
          'application/json': {
            schema: z.array(MeijinListSchema)
          }
        },
        description: '直近の棋譜一覧'
      }
    }
  }),
  async (c) => {
    return c.json(await c.env.CLIENT.get('/list/meijin_all_game_list.txt'), 200)
  }
)

// app.openapi(
//   createRoute({
//     method: 'get',
//     path: '/:game_id',
//     tags: ['Meijin'],
//     middleware: [],
//     summary: 'Get Game Details',
//     description: 'Get Game Details',
//     request: {
//       params: z.object({
//         game_id: z.coerce.number().int()
//       })
//     },
//     responses: {
//       200: {
//         content: {
//           'application/json': {
//             schema: JKFSchema
//           }
//         },
//         description: '直近の棋譜一覧'
//       }
//     }
//   }),
//   async (c) => {
//     const { game_id } = c.req.valid('param')
//     return c.json(
//       await c.env.CLIENT.get('/ai/:game_id:format', {
//         params: {
//           game_id: game_id,
//           format: '.json'
//         }
//       })
//     )
//   }
// )

export default app
