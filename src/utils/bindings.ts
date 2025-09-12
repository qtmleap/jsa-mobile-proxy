import type { PrismaClient } from '@prisma/client'
import type { ZodiosInstance } from '@zodios/core'
import type { JSAMobileEndpoint } from './client'

export interface Env {
  JSA_MOBILE_USERNAME: string
  JSA_MOBILE_PASSWORD: string
  BUCKET: R2Bucket
  KV: KVNamespace
  DB: D1Database
  PRISMA: PrismaClient
  CLIENT: ZodiosInstance<JSAMobileEndpoint>
}
