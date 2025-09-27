import { describe } from 'bun:test'
import { doesNotThrow } from 'node:assert'
import { it } from 'node:test'
import { GameJSONSchema } from '@/models/ai.dto'
import { readJSONSync } from '../client'

describe('Equality', () => {
  const _expected = readJSONSync('ai/ip.jsamobile.jp/18440.json')
  const received = readJSONSync('ai/d2pngvm764jm.cloudfront.net/18440.json')

  it('Decode To Record', () => {
    doesNotThrow(() => GameJSONSchema.parse(received))
  })
})
