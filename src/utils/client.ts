import { makeApi, Zodios, type ZodiosInstance } from '@zodios/core'
import * as iconv from 'iconv-lite'
import { exportJKFString, importKIF, type Record } from 'tsshogi'
import z from 'zod'
import { AIGameSchema, AIListSchema, encodeJKF } from '@/models/ai-list.dto'
import { JKFSchema } from '@/models/jkf.dto'
import { decodeMeijinList, MeijinListSchema } from '@/models/meijin-list.dto'
import { SearchRequestSchema } from '@/models/search.dto'
import { GameResultWebhookRequestSchema } from '@/models/webhook.dto'
import type { Env } from './bindings'
import { toNormalize } from './normalize'

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
    response: AIListSchema
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
    response: z
      .array(AIGameSchema.transform(encodeJKF))
      .transform((arr) => arr[0])
      .pipe(JKFSchema)
  },
  {
    method: 'get',
    path: '/list/meijin_all_game_list.txt',
    parameters: [],
    response: z.string().transform(decodeMeijinList).pipe(z.array(MeijinListSchema))
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
    response: z
      .string()
      .nonempty()
      .transform((v) => {
        const record: Record | Error = importKIF(v)
        if (record instanceof Error) {
          throw new Error('Failed to parse KIF')
        }
        return JSON.parse(toNormalize(exportJKFString(record)))
      })
      .pipe(JKFSchema)
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
        responseType: 'json',
        baseURL: 'https://d2pngvm764jm.cloudfront.net'
      }
    }
  })
  client.use('get', '/ai/ai_game_list.txt', {
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
        baseURL: 'https://d2pngvm764jm.cloudfront.net'
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
        baseURL: 'https://d31j6ipzjd5eeo.cloudfront.net',
        responseType: 'arraybuffer',
        transformResponse: [
          (data) => {
            return iconv.decode(Buffer.from(data), 'shift_jis')
          }
        ]
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
        baseURL: 'https://member.meijinsen.jp',
        transformResponse: [
          (data) => {
            return iconv.decode(Buffer.from(data), 'shift_jis')
          }
        ]
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
