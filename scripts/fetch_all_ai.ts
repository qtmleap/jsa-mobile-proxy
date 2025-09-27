// 20000件の配列を処理するスクリプト

import { decodeJSA } from "@mito-shogi/tsshogi-jsa"
import { chunk } from "lodash"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const fetch_game = async (game_id: number): Promise<void> => {
  const url: URL = new URL(`ai/${game_id}.json`,'https://d2pngvm764jm.cloudfront.net')
  const response = await fetch(url.href, {
    method: 'GET',
    headers: {
      'Authorization': 'Basic YXdzX3Nob2dpOlNob2dpTGl2ZQ=='
    }
  })
  const data = await response.json()
  console.log(data)
  // console.log(`Fetched game ${game_id} with status ${status}`)
}

export async function fetchAll() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const aiGameListPath = join(__dirname, 'ai_game_list.txt')

  const games: number[][] = readFileSync(aiGameListPath, 'utf-8')
    .split('\n')
    .map((line) => line.split(',').map(Number));

  for (const chunk_games of games) {
    await Promise.all(chunk_games.map((game) => fetch_game(game)))
    break
  }
}

await fetchAll()
