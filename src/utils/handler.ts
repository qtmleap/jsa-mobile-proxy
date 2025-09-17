import { decodeGameList, decodeJSA, importJSA } from '@mito-shogi/tsshogi-jsa'
import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@prisma/client'
import type { Record } from 'tsshogi'
import type { Env } from './bindings'
import { createClient } from './client'
import { upsertGame, upsertGameInfo } from './prisma'

type GameBuffer = {
  buffer: Buffer
  game_id: number
}

/**
 * Cron Triggerでの実行の場合には初期化が呼ばれずPRISMAとCLIENTがundefinedになっているみたい
 * @param env
 * @param ctx
 */
const update = async (env: Env, _ctx: ExecutionContext, params: { p1: number; p2: number; p3: number }) => {
  const adapter = new PrismaD1(env.DB)
  env.PRISMA = new PrismaClient({ adapter })
  env.CLIENT = createClient(env)

  // 対局一覧取得
  const { games } = decodeGameList(
    await env.CLIENT.get('/api/index.php', {
      queries: {
        // @ts-ignore
        action: 'search',
        p1: params.p1,
        p2: params.p2,
        p3: params.p3
      }
    })
  )
  const buffers: GameBuffer[] = await Promise.all(
    games.map(async (game) => ({
      buffer: await env.CLIENT.get(`/api/index.php`, {
        queries: {
          // @ts-ignore
          action: 'shogi',
          p1: game.game_id
        }
      }),
      game_id: game.game_id
    }))
  )
  // D1に棋譜一覧書き込み
  for (const game of games) {
    await upsertGame(env, game)
  }
  // D1に棋譜詳細書き込み
  await Promise.all(
    buffers.map((buffer) => {
      const record: Record | Error = importJSA(buffer.buffer)
      if (record instanceof Error) {
        throw new Error(`Failed to import JSA for game ${buffer.game_id}: ${record.message}`)
      }
      return upsertGameInfo(env, decodeJSA(buffer.buffer), record)
    })
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
    case '*/5 * * * *':
      ctx.waitUntil(update(env as Env, ctx, { p1: 0, p2: 100, p3: 1 }))
      break
    case '0 * * * *':
      ctx.waitUntil(update(env as Env, ctx, { p1: 0, p2: 200, p3: 2 }))
      break
    case '0 21 * * *':
      ctx.waitUntil(update(env as Env, ctx, { p1: 0, p2: 14000, p3: 3 }))
      break
    default:
      break
  }
}

export default scheduled
