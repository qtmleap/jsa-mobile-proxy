import { makeApi, Zodios, type ZodiosInstance } from '@zodios/core'
import { pluginBaseURL } from '@zodios/plugins'
import z from 'zod'
import { SearchRequestSchema } from '@/models/search.dto'
import type { Env } from './bindings'

export enum EventType {
  TODAY = '対局日'
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
        schema: z.object({
          messages: z.array(
            z.object({
              notification: z.object({
                title: z.string().nonempty(),
                body: z.string().nonempty()
              }),
              topic: z.object({
                key: z.string().nonempty(),
                event: z.enum(EventType)
              })
            })
          )
        })
      }
    ],
    response: z.object({})
  }
])
export type JSAMobileEndpoint = typeof endpoints

export type ClientFactory = (env: Env) => ZodiosInstance<JSAMobileEndpoint>

// 型を付けて関数を宣言
export const createClient: ClientFactory = (env: Env) => {
  const credential: string = btoa(`${env.JSA_MOBILE_USERNAME}:${env.JSA_MOBILE_PASSWORD}`)
  const client = new Zodios('https://ip.jsamobile.jp', endpoints)
  // const client = new Zodios('https://ip.jsamobile.jp', endpoints, {
  //   axiosConfig: {
  //     headers: {
  //       Authorization: `Basic ${credential}`,
  //       'User-Agent': 'JsaLive/2 CFNetwork/3826.500.131 Darwin/24.5.0',
  //       'Accept-Language': 'ja',
  //       'Accept-Encoding': 'gzip, deflate, br',
  //       Accept: '*/*'
  //     },
  //     withCredentials: true,
  //     responseType: 'arraybuffer',
  //     transformResponse: [
  //       (data) => {
  //         if (data instanceof ArrayBuffer) {
  //           return Buffer.from(data)
  //         }
  //         return data
  //       }
  //     ]
  //   }
  // })

  client.use('get', '/api/index.php', {
    name: 'ResponseType',
    async request(_, config) {
      return {
        ...config,
        headers: {
          Authorization: `Basic ${credential}`,
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
  client.use('post', '/api/webhook/games', pluginBaseURL(env.BASE_URL))
  return client
}
