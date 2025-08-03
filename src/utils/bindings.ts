import type { ZodiosInstance } from '@zodios/core'
import type { JSAMobileEndpoint } from './client'

export type Bindings = {
  USERNAME: string
  PASSWORD: string
  BUCKET: R2Bucket
  KV: KVNamespace
  client: ZodiosInstance<JSAMobileEndpoint>
}
