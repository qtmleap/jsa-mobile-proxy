import type { Env } from './bindings'

const queue = async (batch: MessageBatch, _env: Env): Promise<void> => {
  for (const message of batch.messages) {
    console.log(`Processing message: ${message.body}`)
  }
}

export default queue
