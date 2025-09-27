import { describe, expect } from 'bun:test'
import { it } from 'node:test'
import { fetch_ai, fetch_jsam, fetch_meijin, readJSONSync } from '../client'

describe('Equality', () => {
  const games = readJSONSync('meijin/meijin_all_game_list.json')
  it('Record Count', async () => {
    expect(games.length).toBe(13461)
  })
})

describe('Fetch', () => {
  // 全てのidが存在する
  it('第83期名人戦七番勝負第1局', async () => {
    await fetch_jsam(18440)
    await fetch_ai(18440)
    await fetch_meijin(15028, { year: 2025, month: 4, day: 9, rank: 'M7' }) // game_id 18440 => meijin_id 15028
  })
  // meijin_idが存在しない
  it('第72期王座戦五番勝負第1局', async () => {
    await fetch_jsam(17361)
    await fetch_ai(17361)
  })
  // jsam_idが存在しない
  it('第82期順位戦B級1組2回戦', async () => {
    // await fetch_jsam(113657)
    await fetch_ai(113657)
    await fetch_meijin(13657, { year: 2023, month: 7, day: 6, rank: 'B1' }) // game_id 113657 => meijin_id 13657
  })
  // jsam_id, ai_idが存在しない
  it('第83期順位戦C級2組1回戦', async () => {
    // await fetch_jsam(113657)
    await fetch_ai(114584)
    await fetch_meijin(14584, { year: 2024, month: 6, day: 13, rank: 'C2' }) // game_id 114584 => meijin_id 14584
  })
})
