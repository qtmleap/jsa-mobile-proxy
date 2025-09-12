import { makeApi, Zodios, type ZodiosInstance } from '@zodios/core'
import z from 'zod'
import { SearchRequestSchema } from '@/models/search.dto'
import type { Env } from './bindings'

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
  }
])
export type JSAMobileEndpoint = typeof endpoints

export type ClientFactory = (env: Env) => ZodiosInstance<JSAMobileEndpoint>

// 型を付けて関数を宣言
export const createClient: ClientFactory = (env: Env) => {
  const credential: string = btoa(`${env.JSA_MOBILE_USERNAME}:${env.JSA_MOBILE_PASSWORD}`)
  const client = new Zodios('https://ip.jsamobile.jp', endpoints, {
    axiosConfig: {
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
  })
  return client
}
