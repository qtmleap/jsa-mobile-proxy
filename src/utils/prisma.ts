import dayjs from 'dayjs'
import { exportJKFString, type Record, RecordMetadataKey } from 'tsshogi'
import type { Env } from './bindings'

export const upsertGame = async (env: Env, record: Record, gameId: string) => {
  const metadata = record.metadata
  // 対局情報
  const game_id = parseInt(gameId, 10)
  // biome-ignore lint/style/noNonNullAssertion: reason
  const title: string = metadata.getStandardMetadata(RecordMetadataKey.TOURNAMENT)!

  // プレイヤー情報
  // biome-ignore lint/style/noNonNullAssertion: reason
  const black_name: string = metadata.getStandardMetadata(RecordMetadataKey.BLACK_NAME)!
  // biome-ignore lint/style/noNonNullAssertion: reason
  const white_name: string = metadata.getStandardMetadata(RecordMetadataKey.WHITE_NAME)!

  // 日付情報を取得
  // biome-ignore lint/style/noNonNullAssertion: reason
  const date: string = metadata.getStandardMetadata(RecordMetadataKey.DATE)!
  // biome-ignore lint/style/noNonNullAssertion: reason
  const time_limit = metadata.getStandardMetadata(RecordMetadataKey.TIME_LIMIT)!
  // biome-ignore lint/style/noNonNullAssertion: reason
  const start_time = metadata.getStandardMetadata(RecordMetadataKey.START_DATETIME)!
  // biome-ignore lint/style/noNonNullAssertion: reason
  const black_time_limit = metadata.getStandardMetadata(RecordMetadataKey.BLACK_TIME_LIMIT)!
  // biome-ignore lint/style/noNonNullAssertion: reason
  const white_time_limit = metadata.getStandardMetadata(RecordMetadataKey.WHITE_TIME_LIMIT)!

  const end_time: string | undefined = metadata.getStandardMetadata(RecordMetadataKey.END_DATETIME)
  const location: string | undefined = metadata.getStandardMetadata(RecordMetadataKey.PLACE)
  const opening: string | undefined = metadata.getStandardMetadata(RecordMetadataKey.STRATEGY)

  const kif = exportJKFString(record)

  await env.PRISMA.game.upsert({
    where: { id: game_id },
    create: {
      id: game_id,
      moves: record.moves.length,
      title: title,
      blackTime: black_time_limit !== undefined ? parseInt(black_time_limit, 10) : undefined,
      whiteTime: white_time_limit !== undefined ? parseInt(white_time_limit, 10) : undefined,
      location: location,
      kif: kif,
      timeLimit: parseInt(time_limit, 10),
      startTime: dayjs(start_time).toDate(),
      date: date,
      endTime: end_time === undefined ? undefined : dayjs(end_time).toDate(),
      black: {
        connectOrCreate: {
          where: { name: black_name },
          create: { name: black_name }
        }
      },
      white: {
        connectOrCreate: {
          where: { name: white_name },
          create: { name: white_name }
        }
      },
      tags: opening
        ? {
            connectOrCreate: {
              where: { name: opening },
              create: { name: opening }
            }
          }
        : undefined
    },
    update: {
      moves: record.moves.length,
      endTime: end_time === undefined ? undefined : dayjs(end_time).toDate(),
      black: {
        connectOrCreate: {
          where: { name: black_name },
          create: { name: black_name }
        }
      },
      white: {
        connectOrCreate: {
          where: { name: white_name },
          create: { name: white_name }
        }
      },
      tags: opening
        ? {
            connectOrCreate: {
              where: { name: opening },
              create: { name: opening }
            }
          }
        : undefined
    }
  })
}
