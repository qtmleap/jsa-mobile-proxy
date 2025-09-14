import type { PrismaClient } from '@prisma/client'
import type { ZodiosInstance } from '@zodios/core'
import type { JSAMobileEndpoint } from './client'
import type { JWTPayload } from './jwt'

export interface Env {
  JSA_MOBILE_USERNAME: string
  JSA_MOBILE_PASSWORD: string
  JWT_SECRET_KEY: string
  BUCKET: R2Bucket
  KV: KVNamespace
  DB: D1Database
  PRISMA: PrismaClient
  CLIENT: ZodiosInstance<JSAMobileEndpoint>
  RATE_LIMITTER: KVNamespace
  PLAN_ID: number
  IS_PREMIUM: boolean
}

// Honoのコンテキスト変数の型定義
declare module 'hono' {
  interface ContextVariableMap {
    jwtPayload: JWTPayload | null
    isGuest: boolean
  }
}
