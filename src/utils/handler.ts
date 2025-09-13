import { decodeGameList } from '@mito-shogi/tsshogi-jsa'
import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@prisma/client'
import type { Env } from './bindings'
import { createClient } from './client'
import { upsertGame } from './prisma'

type GameBuffer = {
  buffer: Buffer
  game_id: string
}

/**
 * Cron Triggerでの実行の場合には初期化が呼ばれずPRISMAとCLIENTがundefinedになっているみたい
 * @param env
 * @param ctx
 */
const update = async (env: Env, _ctx: ExecutionContext) => {
  const adapter = new PrismaD1(env.DB)
  env.PRISMA = new PrismaClient({ adapter })
  env.CLIENT = createClient(env)

  const { games } = decodeGameList(
    await env.CLIENT.get('/api/index.php', {
      queries: {
        // @ts-ignore
        action: 'search',
        p1: 0,
        p2: 200,
        p3: 2
      }
    })
  )
  // D1にデータを保存
  const results = await Promise.allSettled(
    games.filter((game) => game.length === 0).map((game) => upsertGame(env, game))
  )
  console.log(`Updated ${results.length} games`)
  const failures = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected')
  if (failures.length > 0) {
    console.error(`Failed to update ${failures.length} games`)
  }
  const buffers: GameBuffer[] = await Promise.all(
    games
      .filter((game) => game.length !== 0)
      .slice(0, 100)
      .map(async (game) => ({
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
  // R2にバイナリ保存
  await Promise.all(
    buffers.map((buffer) => env.BUCKET.put(`bin/${buffer.game_id}.bin`, buffer.buffer), {
      httpMetadata: {
        contentType: 'application/octet-stream',
        contentDisposition: 'attachment'
      }
    })
  )
}

const scheduled: ExportedHandlerScheduledHandler = async (
  event: ScheduledController,
  env: unknown,
  ctx: ExecutionContext
) => {
  console.log(`Scheduled event received: ${event.cron}`)
  switch (event.cron) {
    case '*/1 * * * *':
      ctx.waitUntil(update(env as Env, ctx))
      break
    default:
      break
  }
}

export default scheduled
