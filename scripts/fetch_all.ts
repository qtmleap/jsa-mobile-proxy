// 20000件の配列を処理するスクリプト

import { decodeJSA } from "@mito-shogi/tsshogi-jsa"
import { chunk } from "lodash"

const fetch_game = async (game_id: number): Promise<void> => {
  const url: URL = new URL(`api/search/${game_id}`,'https://jsa-mobile-proxy-prod.lemonandchan.workers.dev/')
  const { status } = await fetch(url.href)
  console.log(`Fetched game ${game_id} with status ${status}`)
}

export async function fetchAll() {
  const games: number[][] = chunk(Array.from({ length: 20000 }, (_, i) => i), 25);

  for (const chunk_games of games) {
    await Promise.all(chunk_games.map((game) => fetch_game(game)))
  }
}

await fetchAll()
