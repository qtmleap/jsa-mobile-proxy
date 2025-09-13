import z from 'zod'

export const PlayerSchema = z
  .object({
    name: z.string().nonempty(),
    _count: z
      .object({
        blackGames: z.number().int(),
        whiteGames: z.number().int()
      })
      .transform((v) => v.blackGames + v.whiteGames)
  })
  .transform((v) => ({
    name: v.name,
    count: v._count
  }))

export type Player = z.infer<typeof PlayerSchema>
