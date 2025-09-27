import { z } from '@hono/zod-openapi'
import {
  exportJKFString,
  InitialPositionType,
  type Move,
  PieceType,
  Position,
  Record,
  SpecialMoveType,
  Square
} from 'tsshogi'
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

const encodeJKF = (game: Game): any => {
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
  return JSON.parse(exportJKFString(record))
}

export const GameSchema = z.object({
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
  kif: z.array(KifSchema),
  breaktime: z.array(z.any())
})

export const GameJSONSchema = z.array(GameSchema.transform(encodeJKF).pipe(JKFSchema))

export type Game = z.infer<typeof GameSchema>
