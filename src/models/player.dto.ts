import z from 'zod'

export const PlayerSchema = z.object({
  name: z.string().nonempty()
})

export type Player = z.infer<typeof PlayerSchema>
