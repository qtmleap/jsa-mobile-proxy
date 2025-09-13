// 20000件の配列を処理するスクリプト

import { decodeJSA } from "@mito-shogi/tsshogi-jsa"
import { chunk } from "lodash"

const fetch_game = async (game_id: number): Promise<void> => {
  const url: URL = new URL(`api/search/${game_id}`,'https://jsa-mobile-proxy.lemonandchan.workers.dev/')
  await fetch(url.href)
  console.log(`Fetched game ${game_id}`)
}

export async function fetchAll() {
  const games: number[][] = chunk(Array.from({ length: 1000 }, (_, i) => 4000 - i), 25);

  for (const chunk_games of games) {
    await Promise.all(chunk_games.map((game) => fetch_game(game)))
  }
}

await fetchAll()
