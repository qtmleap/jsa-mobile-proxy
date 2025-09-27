import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@prisma/client'
import { uniqBy } from 'lodash'
import type { Env } from './bindings'
import { createClient, EventType } from './client'
import { D1Write, D1WriteList, type GameBuffer, GetFinishedGameList, GetGameBufferList, GetGameList, R2Write } from './service'

/**
 * データ保存と書き込み
 * @param env
 * @param ctx
 */
const _update = async (env: Env, _ctx: ExecutionContext, params: { p1: number; p2: number; p3: number }) => {
  const buffers: GameBuffer[] = await GetGameBufferList(env, params)
  await D1WriteList(env, buffers)
  await D1Write(env, buffers)
  await R2Write(env, buffers)
}

namespace PushService {
  /**
   * 対局終了通知
   */
  export const game_end = async (env: Env) => {
    console.log('PushService.game_end')
    const games = await GetFinishedGameList(env)
    const messages = uniqBy(
      games.flatMap((game) =>
        [game.black, game.white].map((player) => ({
          notification: {
            title: '対局終了通知',
            body: `${player.displayText}の対局が終了しました`
          },
          topic: {
            key: player.name,
            event: EventType.GAME_END
          }
        }))
      ),
      'topic.key'
    )
    console.log(JSON.stringify(messages, null, 2))
    if (messages.length !== 0) {
      try {
        await env.CLIENT.post('/api/webhook/games', {
          messages: messages
        })
      } catch (error) {
        console.error(error)
      }
    } else {
      console.log('No messages to send')
    }
  }

  /**
   * 当日の対局通知
   * @param env
   */
  export const today = async (env: Env) => {
    console.log('PushService.today')
    const games = await GetGameList(env, { p1: 0, p2: 100, p3: 1 })
    const messages = uniqBy(
      games.flatMap((game) =>
        [game.black, game.white].map((player) => ({
          notification: {
            title: '対局日通知',
            body: `本日は${player.displayText}の対局日です`
          },
          topic: {
            key: player.name,
            event: EventType.TODAY
          }
        }))
      ),
      'topic.key'
    )
    console.log(JSON.stringify(messages, null, 2))
    if (messages.length !== 0) {
      try {
        await env.CLIENT.post('/api/webhook/games', {
          messages: messages
        })
      } catch (error) {
        console.error(error)
      }
    } else {
      console.log('No messages to send')
    }
  }
}

const setup_env = (env: Env) => {
  console.log('Setup Environment for Scheduled Event')
  const adapter = new PrismaD1(env.DB)
  env.PRISMA = new PrismaClient({ adapter })
  env.CLIENT = createClient(env)
  return
}

const scheduled: ExportedHandlerScheduledHandler = async (event: ScheduledController, env: unknown, _ctx: ExecutionContext) => {
  const _env: Env = env as Env
  console.log(`Scheduled event received: ${event.cron}`)
  setup_env(env as Env)
  switch (event.cron) {
    case '*/1 * * * *': {
      await _env.JSAM_QUEUE.send({
        type: 'update',
        params: { p1: 0, p2: 100, p3: 1 }
      })
      break
    }
    // 五分毎に対局の最新情報を取得する
    case '*/5 * * * *':
      {
      }
      break
    // 一時間に一回過去二週間の対局情報を取得する
    case '0 * * * *':
      {
      }
      break
    // 午前六時に当日の対局を取得
    case '0 21 * * *':
      {
      }
      break
    // 午前八時に当日の対局を取得
    case '0 23 * * *':
      {
      }
      break
    default:
      {
      }
      break
  }
}

export default scheduled
