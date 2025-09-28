// 20000件の配列を処理するスクリプト

import { decodeJSA } from "@mito-shogi/tsshogi-jsa"
import { chunk } from "lodash"
import { client } from "../__tests__/client"

const fetchAll = async () => {
  const games = await client.get('/ai/ai_game_list.txt')
  console.log(games)
}

await fetchAll()
