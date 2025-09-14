import z from 'zod'

export const TagSchema = z
  .object({
    name: z.string().nonempty(),
    _count: z.object({
      games: z.number().int()
    })
  })
  .transform((v) => ({
    name: v.name,
    count: v._count.games
  }))
  .openapi('TagSchema')

export type Tag = z.infer<typeof TagSchema>
