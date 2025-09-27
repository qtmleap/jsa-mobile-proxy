import { makeApi, Zodios, type ZodiosInstance } from '@zodios/core'
import z from 'zod'
import { GameJSONSchema } from '@/models/ai.dto'
import { KIFSchema } from '@/models/kif.dto'
import { MeijinListStringSchema } from '@/models/meijin-list.dto'
import { SearchRequestSchema } from '@/models/search.dto'
import { GameResultWebhookRequestSchema } from '@/models/webhook.dto'
import type { Env } from './bindings'

export enum EventType {
  TODAY = '対局日',
  GAME_END = '対局終了',
  GAME_START = '対局開始'
}

export const endpoints = makeApi([
  {
    method: 'get',
    path: '/api/index.php',
    parameters: [
      {
        name: 'query',
        type: 'Query',
        schema: SearchRequestSchema
      }
    ],
    response: z.instanceof(Buffer)
  },
  {
    method: 'get',
    path: '/ai/ai_game_list.txt',
    parameters: [],
    response: GameJSONSchema
  },
  {
    method: 'get',
    path: '/ai/:game_id:format',
    parameters: [
      {
        name: 'game_id',
        type: 'Path',
        schema: z.number().int()
      },
      {
        name: 'format',
        type: 'Path',
        schema: z.literal('.json').default('.json')
      }
    ],
    response: GameJSONSchema
  },
  {
    method: 'get',
    path: '/list/meijin_all_game_list.txt',
    parameters: [],
    response: MeijinListStringSchema
  },
  {
    method: 'get',
    path: '/pay/kif/meijinsen/:year/:month/:day/:rank/:game_id:format',
    parameters: [
      {
        name: 'game_id',
        type: 'Path',
        schema: z.number().int()
      },
      {
        name: 'year',
        type: 'Path',
        schema: z
          .number()
          .int()
          .transform((v) => v.toString().padStart(2, '0'))
      },
      {
        name: 'month',
        type: 'Path',
        schema: z
          .number()
          .int()
          .transform((v) => v.toString().padStart(2, '0'))
      },
      {
        name: 'day',
        type: 'Path',
        schema: z
          .number()
          .int()
          .transform((v) => v.toString().padStart(2, '0'))
      },
      {
        name: 'rank',
        type: 'Path',
        schema: z.enum(['M7', 'A', 'B1', 'B2', 'C1', 'C2'])
      },
      {
        name: 'format',
        type: 'Path',
        schema: z.literal('.txt').default('.txt')
      }
    ],
    response: KIFSchema
  },
  {
    method: 'post',
    path: '/api/webhook/games',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: GameResultWebhookRequestSchema
      }
    ],
    requestFormat: 'json',
    response: z.void()
  }
])
export type JSAMobileEndpoint = typeof endpoints

export type ClientFactory = (env: Env) => ZodiosInstance<JSAMobileEndpoint>

// 型を付けて関数を宣言
export const createClient: ClientFactory = (env: Env) => {
  const client = new Zodios('https://ip.jsamobile.jp', endpoints)
  // プラグインを利用して認証情報を設定する
  client.use('get', '/api/index.php', {
    name: 'ResponseType',
    async request(_, config) {
      return {
        ...config,
        auth: {
          username: env.JSA_MOBILE_USERNAME,
          password: env.JSA_MOBILE_PASSWORD
        },
        headers: {
          'User-Agent': 'JsaLive/2 CFNetwork/3826.600.41 Darwin/24.6.0',
          'Accept-Language': 'ja',
          'Accept-Encoding': 'gzip, deflate, br',
          Accept: '*/*'
        },
        withCredentials: true,
        responseType: 'arraybuffer',
        transformResponse: [
          (data) => {
            if (data instanceof ArrayBuffer) {
              return Buffer.from(data)
            }
            return data
          }
        ]
      }
    }
  })
  client.use('get', '/ai/:game_id:format', {
    name: 'AI Auth',
    async request(_, config) {
      return {
        ...config,
        auth: {
          username: env.JSA_AI_USERNAME,
          password: env.JSA_AI_PASSWORD
        },
        headers: {
          'User-Agent': 'JsaLive/2 CFNetwork/3826.600.41 Darwin/24.6.0',
          'Accept-Language': 'ja',
          'Accept-Encoding': 'gzip, deflate, br',
          Accept: '*/*'
        },
        withCredentials: true,
        responseType: 'json'
      }
    }
  })
  client.use('get', '/list/meijin_all_game_list.txt', {
    name: 'Meijin Auth',
    async request(_, config) {
      return {
        ...config,
        auth: {
          username: env.JSA_MEIJIN_USERNAME,
          password: env.JSA_MEIJIN_PASSWORD
        },
        headers: {
          'User-Agent': 'JsaLive/2 CFNetwork/3826.600.41 Darwin/24.6.0',
          'Accept-Language': 'ja',
          'Accept-Encoding': 'gzip, deflate, br',
          Accept: '*/*'
        },
        withCredentials: true,
        responseType: 'json'
      }
    }
  })
  client.use('get', '/pay/kif/meijinsen/:year/:month/:day/:rank/:game_id:format', {
    name: 'ResponseType',
    async request(_, config) {
      return {
        ...config,
        headers: {
          Cookie: `kisen_session=${env.MEIJIN_SESSION}`,
          'User-Agent': 'JsaLive/2 CFNetwork/3826.600.41 Darwin/24.6.0',
          'Accept-Language': 'ja',
          'Accept-Encoding': 'gzip, deflate, br',
          Accept: '*/*'
        },
        withCredentials: true,
        responseType: 'json'
      }
    }
  })
  // プラグインを利用して認証情報を設定する
  client.use('post', '/api/webhook/games', {
    name: 'pluginBaseURL',
    async request(_, config) {
      return {
        ...config,
        headers: {
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Type': 'application/json',
          Accept: '*/*',
          Connection: 'keep-alive',
          'CF-Access-Client-Id': env.CF_ACCESS_CLIENT_ID,
          'CF-Access-Client-Secret': env.CF_ACCESS_CLIENT_SECRET
        },
        baseURL: env.BASE_URL,
        responseType: 'json'
      }
    }
  })
  return client
}
