import { decodeGameList } from '@mito-shogi/tsshogi-jsa'
import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@prisma/client'
import type { Record } from 'tsshogi'
import type { Env } from './bindings'
import { createClient } from './client'
import { upsertGame } from './prisma'

type GameBuffer = {
  buffer: Buffer
  game_id: string
}

type RecordType = {
  data: Record
  game_id: string
}

const update = async (env: Env, ctx: ExecutionContext) => {
  // Cron Triggerでの実行の場合には初期化が呼ばれずPRISMAとCLIENTがundefinedになっているみたい
  const adapter = new PrismaD1(env.DB)
  env.PRISMA = new PrismaClient({ adapter })
  env.CLIENT = createClient(env)

  const { games } = decodeGameList(
    await env.CLIENT.get('/api/index.php', {
      queries: {
        // @ts-ignore
        action: 'search',
        p1: 0,
        p2: 14000,
        p3: 3
      }
    })
  )
  console.log(`Fetched ${games.length} games`)
  ctx.waitUntil(Promise.all(games.map((game) => upsertGame(env, game))))
  // console.log(`Fetched ${games.length} games`)
  // const buffers: GameBuffer[] = await Promise.all(
  //   games
  //     .filter((game) => game.length !== 0)
  //     .slice(0, 100)
  //     .map(async (game) => ({
  //       buffer: await env.CLIENT.get(`/api/index.php`, {
  //         queries: {
  //           // @ts-ignore
  //           action: 'shogi',
  //           p1: game.game_id
  //         }
  //       }),
  //       game_id: game.game_id.toString()
  //     }))
  // )
  // console.log(`Fetched ${games.length} -> ${buffers.length} games`)
  // // R2にバイナリ保存
  // await Promise.all(
  //   buffers.map((buffer) => env.BUCKET.put(`bin/${buffer.game_id}.bin`, buffer.buffer), {
  //     httpMetadata: {
  //       contentType: 'application/octet-stream',
  //       contentDisposition: 'attachment'
  //     }
  //   })
  // )
  // const records: RecordType[] = buffers
  //   .map((buffer) => {
  //     const record: Record | Error = importJSA(buffer.buffer)
  //     if (record instanceof Error) {
  //       return undefined
  //     }
  //     return {
  //       data: record,
  //       game_id: buffer.game_id
  //     }
  //   })
  //   .filter((record): record is RecordType => record !== undefined)
  // // D1に棋譜データ保存
  // await Promise.all(records.map(async (record) => upsertGame(env, record.data, record.game_id)))
  // // KVに棋譜データ保存
  // await Promise.all(records.map((record) => env.KV.put(record.game_id, exportJKFString(record.data))))
  // // R2に棋譜データ保存
  // await Promise.all(
  //   records.map((record) =>
  //     env.BUCKET.put(`kif/${record.game_id}.kif`, exportKIF(record.data), {
  //       httpMetadata: {
  //         contentType: 'text/plain; charset=utf-8',
  //         contentDisposition: 'attachment'
  //       }
  //     })
  //   )
  // )
  // console.log(`Updated ${records.length} records`)
}

const scheduled: ExportedHandlerScheduledHandler = async (
  event: ScheduledController,
  env: unknown,
  ctx: ExecutionContext
) => {
  console.log(`Scheduled event received: ${event.cron}`)
  switch (event.cron) {
    case '*/5 * * * *':
      ctx.waitUntil(update(env as Env, ctx))
      break
    default:
      break
  }
}

export default scheduled
