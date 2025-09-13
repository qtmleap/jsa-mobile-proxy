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
