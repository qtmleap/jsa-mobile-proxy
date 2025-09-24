import z from 'zod'

const GameResultTopicSchema = z.object({
  notification: z.object({
    title: z.string().nonempty(),
    body: z.string().nonempty()
  }),
  topic: z.object({
    key: z.string().nonempty(),
    event: z.string().nonempty()
  })
})

export const GameResultWebhookRequestSchema = z.object({
  messages: z.array(GameResultTopicSchema)
})
