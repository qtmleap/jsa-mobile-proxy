import { decodeGameList, importJSA } from '@mito-shogi/tsshogi-jsa'
import { exportJKFString, exportKIF, type Record } from 'tsshogi'
import type { Bindings } from './bindings'
import { createClient } from './client'

type GameBuffer = {
  buffer: Buffer
  game_id: string
}

type RecordType = {
  data: Record
  game_id: string
}

const update = async (env: Bindings, _ctx: ExecutionContext) => {
  const client = createClient(env)
  const { games } = decodeGameList(
    await client.get('/api/index.php', {
      queries: {
        // @ts-ignore
        action: 'search',
        p1: 0,
        p2: 400,
        p3: 1
      }
    })
  )
  const buffers: GameBuffer[] = await Promise.all(
    games.map(async (game) => ({
      buffer: await client.get(`/api/index.php`, {
        queries: {
          // @ts-ignore
          action: 'shogi',
          p1: game.game_id
        }
      }),
      game_id: game.game_id.toString()
    }))
  )
  await Promise.all(buffers.map((buffer) => env.BUCKET.put(`bin/${buffer.game_id}.bin`, buffer.buffer)))
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
  await Promise.all(records.map((record) => env.KV.put(record.game_id, exportJKFString(record.data))))
  await Promise.all(records.map((record) => env.BUCKET.put(`kif/${record.game_id}.kif`, exportKIF(record.data))))
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
      ctx.waitUntil(update(env as Bindings, ctx))
      break
    default:
      break
  }
}

export default scheduled
