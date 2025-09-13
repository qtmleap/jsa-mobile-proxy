import z from 'zod'

export const TagSchema = z.object({
  name: z.string().nonempty()
})

export type Tag = z.infer<typeof TagSchema>
