import type { PrismaClient } from '@prisma/client'
import type { ZodiosInstance } from '@zodios/core'
import type { JSAMobileEndpoint } from './client'

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
  CF_ACCESS_CLIENT_ID: string
  CF_ACCESS_CLIENT_SECRET: string
  PLAN_ID_LITE: string
  PLAN_ID_BASIC: string
}
