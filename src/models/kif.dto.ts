import { z } from '@hono/zod-openapi'
import { exportJKFString, importKIF, type Record } from 'tsshogi'
import { toNormalize } from '@/utils/normalize'
import { JKFSchema } from './jkf.dto'

export const KIFSchema = z
  .string()
  .nonempty()
  .transform((v) => {
    const record: Record | Error = importKIF(v)
    if (record instanceof Error) {
      throw new Error('Failed to parse KIF')
    }
    return JSON.parse(toNormalize(exportJKFString(record)))
  })
  .pipe(JKFSchema)
