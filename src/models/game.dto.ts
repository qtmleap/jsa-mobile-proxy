import z from 'zod'

export const GameSchema = z.object({
  id: z.number().int().openapi({
    description: '対局ID',
    example: 19249
  }),
  title: z.string().openapi({
    description: 'タイトル',
    example: '第38期竜王戦6組昇級者決定戦'
  }),
  startTime: z.date().openapi({
    description: '開始時刻',
    example: '2025-09-18T01:00:00.000Z'
  }),
  endTime: z.coerce.date().nullable().openapi({
    description: '終了時刻（進行中の場合は未設定）',
    example: '2025-09-13T16:30:00Z'
  }),
  moves: z.number().int().openapi({
    description: '総手数',
    example: 124
  }),
  blackId: z.string().nonempty().openapi({
    description: '先手番の対局者',
    example: '黒田 尭之'
  }),
  whiteId: z.string().nonempty().openapi({
    description: '後手番の対局者',
    example: '高橋 佑二郎'
  }),
  timeLimit: z.number().int().nullable().openapi({
    description: '持ち時間（秒）',
    example: 3600
  }),
  tournament: z.string().nonempty().nullable().openapi({
    description: '棋戦',
    example: '竜王戦'
  }),
  location: z.string().nullable().openapi({
    description: '対局場所',
    example: '東京・将棋会館'
  })
})

export type Game = z.infer<typeof GameSchema>

export const GameRequestQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).openapi({
    description: 'ページ番号',
    example: 1
  }),
  limit: z.coerce.number().int().min(1).max(100).default(20).openapi({
    description: '1ページあたりの取得件数',
    example: 20
  }),
  tournament: z.string().nonempty().optional().openapi({
    description: '棋戦名でフィルタリング',
    example: '竜王戦'
  }),
  player: z.string().nonempty().optional().openapi({
    description: '対局者名でフィルタリング',
    example: '黒田 尭之'
  }),
  startTime: z.coerce.date().optional().openapi({
    description: '開始時刻以降の対局でフィルタリング',
    example: '2025-09-01T00:00:00Z'
  }),
  endTime: z.coerce.date().optional().openapi({
    description: '終了時刻以前の対局でフィルタリング',
    example: '2025-09-30T23:59:59Z'
  })
})
