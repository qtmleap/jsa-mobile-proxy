import { z } from '@hono/zod-openapi'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { toNormalize } from '@/utils/normalize'

dayjs.extend(customParseFormat)

// biome-ignore lint/suspicious/noExplicitAny: reason
const decodeMeijinList = (input: string): any => {
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
  modified: z.coerce.number().int(),
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

// game_id=19308
// meijin_id=15048
// tablet_id=68c02d79f5bdd69b5c5bb29f
// kif_key=/pay/kif/meijinsen/2025/09/24/A1/15048.txt
// modified=1758883571  // 2025/09/26 19:46:11
// start_date=2025/09/24 10:00
// end_date=2025/09/24 21:42
// kisen=第84期順位戦Ａ級３回戦
// side=1
// sente=豊島 将之九段
// gote=増田 康宏八段
// family1=豊島
// name1=将之
// title1=九段
// family2=増田
// name2=康宏
// title2=八段
// senkei=角換わりその他
// result=1
// winner=1
// tesuu=79
// sente_score=１勝１敗
// gote_score=１勝１敗
