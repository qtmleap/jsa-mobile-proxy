import z from 'zod'

export const PlayerSchema = z.object({})

export const GameSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  startTime: z.date(),
  endTime: z.coerce.date().nullable(),
  moves: z.number().int()
  // black: PlayerSchema,
  // white: PlayerSchema
})

export type Player = z.infer<typeof PlayerSchema>
export type Game = z.infer<typeof GameSchema>
