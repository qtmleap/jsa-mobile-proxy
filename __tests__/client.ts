import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { decodeJSA } from '@mito-shogi/tsshogi-jsa'
import { Zodios } from '@zodios/core'
import { AxiosError } from 'axios'
import * as iconv from 'iconv-lite'
import { ZodError } from 'zod'
import { GameJSONSchema } from '@/models/ai.dto'
import { KIFSchema } from '@/models/kif.dto'
import { endpoints } from '@/utils/client'

const client = new Zodios('https://ip.jsamobile.jp', endpoints)

client.use('get', '/api/index.php', {
  name: 'ResponseType',
  async request(_, config) {
    return {
      ...config,
      auth: {
        // biome-ignore lint/style/noNonNullAssertion: reason
        username: process.env.JSA_MOBILE_USERNAME!,
        // biome-ignore lint/style/noNonNullAssertion: reason
        password: process.env.JSA_MOBILE_PASSWORD!
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
  name: 'BaseURL',
  async request(_, config) {
    return {
      ...config,
      auth: {
        // biome-ignore lint/style/noNonNullAssertion: reason
        username: process.env.JSA_AI_USERNAME!,
        // biome-ignore lint/style/noNonNullAssertion: reason
        password: process.env.JSA_AI_PASSWORD!
      },
      // responseType: 'json',
      baseURL: 'https://d2pngvm764jm.cloudfront.net'
    }
  }
})

client.use('get', '/pay/kif/meijinsen/:year/:month/:day/:rank/:game_id:format', {
  name: 'BaseURL',
  async request(_, config) {
    return {
      ...config,
      headers: {
        // biome-ignore lint/style/noNonNullAssertion: reason
        Cookie: `kisen_session=${process.env.MEIJIN_SESSION!}`
      },
      responseType: 'arraybuffer',
      baseURL: 'https://member.meijinsen.jp',
      transformResponse: [
        (data) => {
          return iconv.decode(Buffer.from(data), 'shift_jis')
        }
      ]
    }
  }
})

// biome-ignore lint/suspicious/noExplicitAny: reason
export const readJSONSync = (filePath: string): any => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  return JSON.parse(readFileSync(join(__dirname, filePath), 'utf8'))
}

export const fetch_jsam = async (gameId: number): Promise<void> => {
  try {
    const result = await client.get('/api/index.php', {
      queries: {
        // @ts-ignore
        action: 'shogi',
        p1: gameId
      }
    })
    console.log(gameId, decodeJSA(result).metadata)
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(gameId, error.status, error.message)
    }
    if (error instanceof ZodError) {
      console.error(gameId, error.message)
    }
  }
}

export const fetch_ai = async (gameId: number): Promise<void> => {
  try {
    const result = GameJSONSchema.safeParse(
      await client.get('/ai/:game_id:format', {
        params: {
          game_id: gameId,
          format: '.json'
        }
      })
    )
    if (!result.success) {
      throw new ZodError(result.error.issues)
    }
    console.log(gameId, result.data[0].header)
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(gameId, error.status, error.message)
    }
  }
}

export const fetch_meijin = async (
  gameId: number,
  option: {
    year: number
    month: number
    day: number
    rank: 'M7' | 'A' | 'B1' | 'B2' | 'C1' | 'C2'
  }
): Promise<void> => {
  try {
    const result = KIFSchema.safeParse(
      await client.get('/pay/kif/meijinsen/:year/:month/:day/:rank/:game_id:format', {
        params: {
          year: option.year,
          month: option.month,
          day: option.day,
          rank: option.rank,
          game_id: gameId,
          format: '.txt'
        }
      })
    )
    if (!result.success) {
      throw new ZodError(result.error.issues)
    }
    console.log(gameId, result.data.header)
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(gameId, error.status, error.message)
    }
  }
}
