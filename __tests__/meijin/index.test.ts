import { describe, expect } from 'bun:test'
import { it } from 'node:test'
import { importJKF, type Record, RecordMetadataKey } from 'tsshogi'
import { AIGameJSONSchema } from '@/models/ai-list.dto'
import { MeijinGameStringSchema, MeijinListStringSchema } from '@/models/meijin-list.dto'
import { client, readJSONSync, readTextSync } from '../client'

describe('Equality', () => {
  // AI自動記録と名人戦棋譜速報の棋譜が一致するかどうか
  it('[AI] Record Equality', () => {
    // biome-ignore lint/suspicious/noExplicitAny: reason
    const received: Record | Error = importJKF(MeijinGameStringSchema.parse(readTextSync('meijin/member.meijinsen.jp/15028.txt')) as any)
    // biome-ignore lint/suspicious/noExplicitAny: reason
    const expected: Record | Error = importJKF(AIGameJSONSchema.parse(readJSONSync('meijin/d2pngvm764jm.cloudfront.net/18440.json')) as any)
    if (expected instanceof Error || received instanceof Error) {
      throw expected
    }
    expect(received.metadata.getStandardMetadata(RecordMetadataKey.TITLE)).toEqual(expected.metadata.getStandardMetadata(RecordMetadataKey.TITLE))
    expect(received.metadata.getStandardMetadata(RecordMetadataKey.LENGTH)).toEqual(expected.metadata.getStandardMetadata(RecordMetadataKey.LENGTH))
    expect(received.metadata.getStandardMetadata(RecordMetadataKey.CATEGORY)).toEqual(expected.metadata.getStandardMetadata(RecordMetadataKey.CATEGORY))
    expect(received.metadata.getStandardMetadata(RecordMetadataKey.DATE)).toEqual(expected.metadata.getStandardMetadata(RecordMetadataKey.DATE))
    expect(received.metadata.getStandardMetadata(RecordMetadataKey.START_DATETIME)).toEqual(
      expected.metadata.getStandardMetadata(RecordMetadataKey.START_DATETIME)
    )
    expect(received.metadata.getStandardMetadata(RecordMetadataKey.END_DATETIME)).toEqual(expected.metadata.getStandardMetadata(RecordMetadataKey.END_DATETIME))
  })

  // モバイル観戦の棋譜と名人戦棋譜速報の棋譜が一致するかどうか
  it('[JSAM] Record Equality', () => {
    const received: Record | Error = importJKF(readJSONSync('meijin/ip.jsamobile.jp/18440.json'))
    // biome-ignore lint/suspicious/noExplicitAny: reason
    const expected: Record | Error = importJKF(AIGameJSONSchema.parse(readJSONSync('meijin/d2pngvm764jm.cloudfront.net/18440.json')) as any)
    if (expected instanceof Error || received instanceof Error) {
      throw expected
    }
    expect(received.metadata.getStandardMetadata(RecordMetadataKey.TITLE)).toEqual(expected.metadata.getStandardMetadata(RecordMetadataKey.TITLE))
    expect(received.metadata.getStandardMetadata(RecordMetadataKey.LENGTH)).toEqual(expected.metadata.getStandardMetadata(RecordMetadataKey.LENGTH))
    expect(received.metadata.getStandardMetadata(RecordMetadataKey.CATEGORY)).toEqual(expected.metadata.getStandardMetadata(RecordMetadataKey.CATEGORY))
    expect(received.metadata.getStandardMetadata(RecordMetadataKey.DATE)).toEqual(expected.metadata.getStandardMetadata(RecordMetadataKey.DATE))
    expect(received.metadata.getStandardMetadata(RecordMetadataKey.START_DATETIME)).toEqual(
      expected.metadata.getStandardMetadata(RecordMetadataKey.START_DATETIME)
    )
    expect(received.metadata.getStandardMetadata(RecordMetadataKey.END_DATETIME)).toEqual(expected.metadata.getStandardMetadata(RecordMetadataKey.END_DATETIME))
  })
})

describe('Parse Meijin Game List', () => {
  const text = readTextSync('meijin/meijin_all_game_list.txt')
  it('Parse', async () => {
    const result = MeijinListStringSchema.safeParse(text)
    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error('Failed to parse Meijin game list')
    }
    expect(result.data.games.length).toBeGreaterThanOrEqual(13461)
  })
})

describe('Fetch Meijin Game List', () => {
  it('Fetch', async () => {
    const result = MeijinListStringSchema.safeParse(await client.get('/list/meijin_all_game_list.txt'))
    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error('Failed to parse Meijin game list')
    }
    expect(result.data.games.length).toBeGreaterThanOrEqual(13461)
  })
})

describe('Fetch Meijin Game', () => {
  it('第83期名人戦七番勝負第1局', async () => {
    const data = await client.get('/pay/kif/meijinsen/:year/:month/:day/:rank/:game_id:format', {
      params: {
        year: 2025,
        month: 4,
        day: 9,
        rank: 'M7',
        game_id: 15028,
        format: '.txt'
      }
    })
    const result = MeijinGameStringSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error('Failed to parse Meijin game')
    }
  })
})
