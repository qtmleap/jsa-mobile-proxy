import { decodeGameList, importJSA } from '@mito-shogi/tsshogi-jsa'
import { exportJKFString, exportKIF, type Record } from 'tsshogi'
import type { Env } from './bindings'
import { upsertGame } from './prisma'

type GameBuffer = {
  buffer: Buffer
  game_id: string
}

type RecordType = {
  data: Record
  game_id: string
}

const update = async (env: Env, _ctx: ExecutionContext) => {
  const { games } = decodeGameList(
    await env.CLIENT.get('/api/index.php', {
      queries: {
        // @ts-ignore
        action: 'search',
        p1: 0,
        p2: 400,
        p3: 1
      }
    })
  )
  console.debug(`Fetched ${games.length} games`)
  const buffers: GameBuffer[] = await Promise.all(
    games.map(async (game) => ({
      buffer: await env.CLIENT.get(`/api/index.php`, {
        queries: {
          // @ts-ignore
          action: 'shogi',
          p1: game.game_id
        }
      }),
      game_id: game.game_id.toString()
    }))
  )
  // バイナリ保存
  await Promise.all(
    buffers.map((buffer) => env.BUCKET.put(`bin/${buffer.game_id}.bin`, buffer.buffer), {
      httpMetadata: {
        contentType: 'application/octet-stream',
        contentDisposition: 'attachment'
      }
    })
  )
  const records: RecordType[] = buffers
    .map((buffer) => {
      const record: Record | Error = importJSA(buffer.buffer)
      if (record instanceof Error) {
        return undefined
      }
      return {
        data: record,
        game_id: buffer.game_id
      }
    })
    .filter((record): record is RecordType => record !== undefined)
  // D1に棋譜データ保存
  await Promise.all(records.map(async (record) => upsertGame(env, record.data, record.game_id)))
  // KVに棋譜データ保存
  await Promise.all(records.map((record) => env.KV.put(record.game_id, exportJKFString(record.data))))
  // R2に棋譜データ保存
  await Promise.all(
    records.map((record) =>
      env.BUCKET.put(`kif/${record.game_id}.kif`, exportKIF(record.data), {
        httpMetadata: {
          contentType: 'text/plain; charset=utf-8',
          contentDisposition: 'attachment'
        }
      })
    )
  )
  console.debug(`Updated ${records.length} records`)
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
