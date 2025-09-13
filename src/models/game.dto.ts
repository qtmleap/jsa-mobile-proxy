import z from 'zod'

export const GameSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  startTime: z.date(),
  endTime: z.coerce.date().optional(),
  moves: z.number().int(),
  blackId: z.string().nonempty(),
  whiteId: z.string().nonempty(),
  timeLimit: z.number().int().optional(),
  tournament: z.string().nonempty().optional(),
  location: z.string().optional()
})

export type Game = z.infer<typeof GameSchema>

export const GameRequestQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  tournament: z.string().nonempty().optional(),
  player: z.string().nonempty().optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional()
})
