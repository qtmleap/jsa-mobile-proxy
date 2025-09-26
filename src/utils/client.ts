import { makeApi, Zodios, type ZodiosInstance } from '@zodios/core'
import z from 'zod'
import { SearchRequestSchema } from '@/models/search.dto'
import { GameResultWebhookRequestSchema } from '@/models/webhook.dto'
import type { Env } from './bindings'

export enum EventType {
  TODAY = '対局日',
  GAME_END = '対局終了',
  GAME_START = '対局開始'
}

const endpoints = makeApi([
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
          'User-Agent': 'JsaLive/2 CFNetwork/3826.500.131 Darwin/24.5.0',
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
