import { beforeEach, describe, expect, it } from 'bun:test'
import { importJKF, type Record, RecordMetadataKey } from 'tsshogi'
import { AIGameJSONSchema, AIListSchema } from '@/models/ai-list.dto'
import { client, readJSONSync, readTextSync } from '../client'

describe('Equality', () => {
  const expected: Record | Error = importJKF(readJSONSync('ai/ip.jsamobile.jp/18440.json'))
  const received = readJSONSync('ai/d2pngvm764jm.cloudfront.net/18440.json')

  beforeEach(() => {})

  // AI自動記録とモバイル観戦の棋譜が一致するかどうか
  it('Record Equality', () => {
    if (expected instanceof Error) {
      throw expected
    }
    const result = AIGameJSONSchema.safeParse(received)
    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error('Failed to parse received data')
    }
    // biome-ignore lint/suspicious/noExplicitAny: reason
    const record: Record | Error = importJKF(result.data as any)
    if (record instanceof Error) {
      throw record
    }
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.TITLE)).toEqual(expected.metadata.getStandardMetadata(RecordMetadataKey.TITLE))
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.LENGTH)).toEqual(expected.metadata.getStandardMetadata(RecordMetadataKey.LENGTH))
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.CATEGORY)).toEqual(expected.metadata.getStandardMetadata(RecordMetadataKey.CATEGORY))
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.DATE)).toEqual(expected.metadata.getStandardMetadata(RecordMetadataKey.DATE))
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.START_DATETIME)).toEqual(
      expected.metadata.getStandardMetadata(RecordMetadataKey.START_DATETIME)
    )
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.END_DATETIME)).toEqual(expected.metadata.getStandardMetadata(RecordMetadataKey.END_DATETIME))
  })

  // AI自動記録のテキストがパースできるかどうか
  it('Parse AI Game List', async () => {
    const text: string = readTextSync('ai/ai_game_list.txt')
    const result = AIListSchema.safeParse(text)
    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error('Failed to parse AI game list')
    }
    expect(result.data.games.length).toBe(7810)
  })

  // AI自動記録のJSONが正しくJKFにパースできるかどうか
  it('Decode To JKF', () => {
    const result = AIGameJSONSchema.safeParse(received)
    expect(result.success).toBe(true)
    if (!result.success) {
      throw new Error('Failed to parse received data')
    }
    // biome-ignore lint/suspicious/noExplicitAny: reason
    const record: Record | Error = importJKF(result.data as any)
    if (record instanceof Error) {
      throw record
    }
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.LENGTH)).toBe('134')
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.TITLE)).toBe('第83期名人戦七番勝負第1局')
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.TOURNAMENT)).toBe('名人戦')
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.BLACK_NAME)).toBe('永瀬拓矢九段')
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.WHITE_NAME)).toBe('藤井聡太名人')
  })

  it('Fetch AI Game List', async () => {
    const result = await client.get('/ai/ai_game_list.txt')
    // expect(result.success).toBe(true)
    // if (!result.success) {
    //   throw new Error('Failed to fetch AI game list')
    // }
    expect(result.games.length).toBeGreaterThan(7810)
  })
})
