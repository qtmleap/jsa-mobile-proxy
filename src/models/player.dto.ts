import z from 'zod'

export const PlayerSchema = z
  .object({
    name: z.string().nonempty().openapi({
      description: 'プレイヤー名',
      example: '藤井 聡太'
    }),
    count: z.number().int().nonnegative().openapi({
      description: '対局数',
      example: 42
    })
  })
  .openapi('PlayerSchema')

export type Player = z.infer<typeof PlayerSchema>

export const PlayerRequestQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).openapi({
    description: 'ページ番号',
    example: 1
  }),
  limit: z.coerce.number().int().min(1).max(1000).default(1000).openapi({
    description: '1ページあたりの取得件数（デフォルト1000で一括取得）',
    example: 1000
  })
})
