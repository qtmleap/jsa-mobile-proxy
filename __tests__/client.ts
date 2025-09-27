import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { decodeJSA } from '@mito-shogi/tsshogi-jsa'
import { AxiosError } from 'axios'
import { ZodError } from 'zod'
import { GameJSONSchema } from '@/models/ai.dto'
import { KIFSchema } from '@/models/kif.dto'
import type { Env } from '@/utils/bindings'
import { createClient } from '@/utils/client'

const env: Env = {
  // biome-ignore lint/style/noNonNullAssertion: reason
  JSA_MOBILE_USERNAME: process.env.JSA_MOBILE_USERNAME!,
  // biome-ignore lint/style/noNonNullAssertion: reason
  JSA_MOBILE_PASSWORD: process.env.JSA_MOBILE_PASSWORD!,
  // biome-ignore lint/style/noNonNullAssertion: reason
  JSA_AI_USERNAME: process.env.JSA_AI_USERNAME!,
  // biome-ignore lint/style/noNonNullAssertion: reason
  JSA_AI_PASSWORD: process.env.JSA_AI_PASSWORD!,
  // biome-ignore lint/style/noNonNullAssertion: reason
  JSA_MEIJIN_USERNAME: process.env.JSA_MEIJIN_USERNAME!,
  // biome-ignore lint/style/noNonNullAssertion: reason
  JSA_MEIJIN_PASSWORD: process.env.JSA_MEIJIN_PASSWORD!,
  // biome-ignore lint/style/noNonNullAssertion: reason
  MEIJIN_SESSION: process.env.MEIJIN_SESSION!
} as Env

export const client = createClient(env)

// biome-ignore lint/suspicious/noExplicitAny: reason
export const readJSONSync = (filePath: string): any => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  return JSON.parse(readFileSync(join(__dirname, filePath), 'utf8'))
}

export const readTextSync = (filePath: string): string => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  return readFileSync(join(__dirname, filePath), 'utf8')
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
