import { SearchRequestSchema } from "@/models/search.dto"
import { makeApi, Zodios } from "@zodios/core"
import z from "zod"

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

const credential: string = btoa(`${import.meta.env.USERNAME}:${import.meta.env.PASSWORD}`)
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
