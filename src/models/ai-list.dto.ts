import { z } from '@hono/zod-openapi'
import { TournamentList } from '@mito-shogi/tsshogi-jsa'
import dayjs from 'dayjs'
import { exportJKFString, InitialPositionType, type Move, PieceType, Position, Record, RecordMetadataKey, SpecialMoveType, Square } from 'tsshogi'
import { toNormalize } from '@/utils/normalize'
import { JKFSchema } from './jkf.dto'

export const KifSchema = z.object({
  num: z.number(),
  time: z.number(),
  toX: z.union([z.number(), z.null()]),
  toY: z.union([z.number(), z.null()]),
  type: z.string(),
  frX: z.union([z.number(), z.null()]),
  frY: z.union([z.number(), z.null()]),
  prmt: z.union([z.number(), z.null()]),
  spend: z.number(),
  move: z.string(),
  _id: z.string()
})

// biome-ignore lint/suspicious/noExplicitAny: reason
export const encodeJKF = (game: AIGame): any => {
  const position: Position = (() => {
    if (game.handicap === '平手') {
      // biome-ignore lint/style/noNonNullAssertion: ignore
      return Position.newBySFEN(InitialPositionType.STANDARD)!
    }
    throw new Error('Not implemented')
  })()
  const record: Record = new Record(position)
  for (const kif of game.kif) {
    // 多分これになるのは投了のときだけ
    if (kif.toX === null || kif.toY === null) {
      if (kif.move === '投了') {
        record.append(SpecialMoveType.RESIGN)
        continue
      }
      throw new Error(`Invalid SpecialMoveType ${kif.move}`)
    }
    if (kif.frX === null || kif.frY === null) {
      continue
    }
    const to: Square = new Square(kif.toX, kif.toY)
    const from: Square | PieceType = (() => {
      if (kif.frY === 0 || kif.frY >= 10) {
        switch (kif.type) {
          case 'KYO':
            return PieceType.LANCE
          case 'KEI':
            return PieceType.KNIGHT
          case 'GIN':
            return PieceType.SILVER
          case 'KIN':
            return PieceType.GOLD
          case 'KAKU':
            return PieceType.BISHOP
          case 'HI':
            return PieceType.ROOK
          case 'FU':
            return PieceType.PAWN
          default:
            throw new Error(`Unknown piece type: ${kif.type}`)
        }
      }
      return new Square(kif.frX, kif.frY)
    })()
    const move: Move | null = record.position.createMove(from, to)
    if (move === null) {
      console.error(kif)
      throw new Error(`Invalid move: from ${from} to ${to}`)
    }
    // 成り判定
    move.promote = kif.prmt === 1
    record.append(move, { ignoreValidation: false })
    // 消費時間を追加
    record.current.setElapsedMs(kif.spend * 1000)
  }
  const tournament = TournamentList.find((t) => t.keys.some((key) => game.event.includes(key)))?.value
  // const tournament = TournamentList.find((t) => t.keys.some(key) => game.title.includes(key))?.value)
  record.metadata.setStandardMetadata(RecordMetadataKey.TITLE, toNormalize(game.event))
  record.metadata.setStandardMetadata(RecordMetadataKey.DATE, dayjs(game.starttime).format('YYYY/MM/DD'))
  record.metadata.setStandardMetadata(RecordMetadataKey.START_DATETIME, dayjs(game.starttime).format('YYYY/MM/DD HH:mm:ss'))
  record.metadata.setStandardMetadata(RecordMetadataKey.TIME_LIMIT, game.timelimit)
  record.metadata.setStandardMetadata(RecordMetadataKey.BLACK_TIME_LIMIT, game.timelimit)
  record.metadata.setStandardMetadata(RecordMetadataKey.WHITE_TIME_LIMIT, game.timelimit)
  record.metadata.setStandardMetadata(RecordMetadataKey.LENGTH, (game.end_tesu - 1).toString())
  if (tournament !== undefined) {
    record.metadata.setStandardMetadata(RecordMetadataKey.TOURNAMENT, tournament)
  }
  record.metadata.setStandardMetadata(RecordMetadataKey.STRATEGY, '')
  record.metadata.setStandardMetadata(RecordMetadataKey.END_DATETIME, dayjs(game.endtime).format('YYYY/MM/DD HH:mm:ss'))
  record.metadata.setStandardMetadata(RecordMetadataKey.PLACE, toNormalize(game.place))
  record.metadata.setStandardMetadata(RecordMetadataKey.BLACK_NAME, game.player2)
  record.metadata.setStandardMetadata(RecordMetadataKey.WHITE_NAME, game.player1)
  return JSON.parse(exportJKFString(record))
}

export const AIGameSchema = z.object({
  _id: z.string(),
  modified_at: z.coerce.date(),
  gametype: z.string(),
  key: z.string(),
  fname: z.string(),
  event: z.string(),
  player1: z.string(),
  player2: z.string(),
  side: z.string(),
  place: z.string(),
  starttime: z.string(),
  realstarttime: z.number(),
  endtime: z.coerce.date(),
  timelimit: z.string(),
  countdown: z.string(),
  spendtime_p1: z.string(),
  spendtime_p2: z.string(),
  delaytimes_p1: z.string(),
  delaytimes_p2: z.string(),
  delatetime_p1: z.string(),
  delatetime_p2: z.string(),
  lunchtime_start: z.string(),
  lunchtime_end: z.string(),
  dinnertime_start: z.string(),
  dinnertime_end: z.string(),
  stoptime_start: z.string(),
  stoptime_end: z.string(),
  recordman: z.string(),
  judgeside: z.string(),
  note: z.string(),
  end_tesu: z.number(),
  end_mark: z.string(),
  end_reason: z.string(),
  end_side: z.string(),
  __v: z.number(),
  dinnertime_end_2: z.string(),
  dinnertime_start_2: z.string(),
  handicap: z.string(),
  lunchtime_end_2: z.string(),
  lunchtime_start_2: z.string(),
  modified_by: z.string(),
  enddate: z.string(),
  kif: z.array(KifSchema)
  // breaktime: z.array(z.any())
})

export type AIGame = z.infer<typeof AIGameSchema>

export const AIListSchema = z
  .string()
  .nonempty()
  .transform((v) => ({
    games: v
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => !line.startsWith('#'))
      .filter((line) => !Number.isNaN(parseInt(line, 10)))
      .map((line) => ({
        game_id: parseInt(line, 10)
      }))
  }))

export const AIGameJSONSchema = z
  .array(AIGameSchema.transform(encodeJKF))
  .transform((arr) => arr[0])
  .pipe(JKFSchema)
