import { z } from '@hono/zod-openapi'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { toNormalize } from '@/utils/normalize'

dayjs.extend(customParseFormat)

// biome-ignore lint/suspicious/noExplicitAny: reason
export const decodeMeijinList = (input: string): any => {
  // 余計なデータを正規化する
  const blocks: string[] = toNormalize(input)
    .split('/-----')
    .map((line) => line.trim())
  if (blocks.length === 0) {
    throw new Error('No data found')
  }
  return blocks.slice(1, -1).map((block) =>
    Object.fromEntries(
      block.split('\n').map((line) =>
        line
          .replace(/\s*\/\/.*$/, '')
          .split('=')
          .map((s) => s.trim())
      )
    )
  )
}

const toNormalizeDate = (input: string): string => {
  const date = dayjs(input, ['YYYY/MM/DD HH:mm', 'YYYY/MM/DD H:mm', 'YYYY/MM/D HH:mm', 'YYYY/M/DD/H:mm', 'YYYY/MM/DD'])
  const isValid = date.isValid()
  if (!isValid) {
    throw new Error(`Invalid date format: ${input}`)
  }
  return date.format('YYYY-MM-DD HH:mm')
}

export const MeijinListSchema = z.object({
  game_id: z.coerce.number().int(),
  meijin_id: z.coerce.number().int(),
  // biome-ignore lint/suspicious/noExplicitAny: reason
  tablet_id: z.preprocess((input: any) => (input === undefined ? undefined : input.length === 0 ? undefined : input), z.string().nonempty().optional()),
  kif_key: z.string().nonempty(),
  modified: z.coerce
    .number()
    .int()
    .transform((v) => dayjs(v * 1000).format('YYYY-MM-DD HH:mm')),
  start_date: z.preprocess(
    // biome-ignore lint/suspicious/noExplicitAny: reason
    (input: any) => (input === undefined ? undefined : input.length === 0 ? undefined : toNormalizeDate(input)),
    z.coerce.date().optional()
  ),
  end_date: z.preprocess(
    // biome-ignore lint/suspicious/noExplicitAny: reason
    (input: any) => (input === undefined ? undefined : input.length === 0 ? undefined : toNormalizeDate(input)),
    z.coerce.date().optional()
  ),
  kisen: z.string().nonempty(),
  side: z.coerce.number().int(),
  sente: z.string().nonempty(),
  gote: z.string().nonempty(),
  family1: z.string().nonempty(),
  name1: z.string().nonempty(),
  title1: z.string().nonempty().optional(),
  family2: z.string().nonempty(),
  name2: z.string().nonempty().optional(),
  title2: z.string().nonempty().optional(),
  // biome-ignore lint/suspicious/noExplicitAny: reason
  senkei: z.preprocess((input: any) => (input === undefined ? undefined : input.length === 0 ? undefined : input), z.string().nonempty().optional()),
  result: z.coerce.number().int(),
  winner: z.coerce.number().int(),
  tesuu: z.coerce.number().int(),
  // biome-ignore lint/suspicious/noExplicitAny: reason
  sente_score: z.preprocess((input: any) => (input === undefined ? undefined : input.length === 0 ? undefined : input), z.string().nonempty().optional()),
  // biome-ignore lint/suspicious/noExplicitAny: reason
  gote_score: z.preprocess((input: any) => (input === undefined ? undefined : input.length === 0 ? undefined : input), z.string().nonempty().optional())
})

export const MeijinListStringSchema = z.string().transform(decodeMeijinList).pipe(z.array(MeijinListSchema))
