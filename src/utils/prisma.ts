import type { Game, GameInfo } from '@mito-shogi/tsshogi-jsa'
import dayjs from 'dayjs'
import { exportJKFString, type Record } from 'tsshogi'
import type { Env } from './bindings'

/**
 * 対局情報詳細データ書き込み
 * @param env
 * @param game
 * @param record
 * @returns
 */
export const upsertGameInfo = async (env: Env, game: GameInfo, record: Record) => {
  return await env.PRISMA.game.upsert({
    where: { id: game.info.game_id },
    create: {
      id: game.info.game_id,
      moves: game.info.moves,
      title: game.info.title,
      date: dayjs(game.info.start_time).format('YYYY/MM/DD'),
      black: {
        connectOrCreate: {
          where: { name: game.black.name },
          create: { name: game.black.name }
        }
      },
      blackTime: game.info.time,
      white: {
        connectOrCreate: {
          where: { name: game.white.name },
          create: { name: game.white.name }
        }
      },
      whiteTime: game.info.time,
      kif: exportJKFString(record),
      startTime: dayjs(game.info.start_time).toDate(),
      endTime: game.info.end_time ? dayjs(game.info.end_time).toDate() : undefined,
      timeLimit: game.info.time,
      location: game.info.location,
      tournament: game.info.tournament,
      tags: game.info.opening
        ? {
            connectOrCreate: {
              where: { name: game.info.opening },
              create: { name: game.info.opening }
            }
          }
        : undefined
    },
    update: {
      moves: game.info.moves,
      kif: exportJKFString(record),
      blackTime: game.info.time,
      whiteTime: game.info.time,
      startTime: dayjs(game.info.start_time).toDate(),
      endTime: game.info.end_time ? dayjs(game.info.end_time).toDate() : undefined,
      location: game.info.location,
      tournament: game.info.tournament,
      timeLimit: game.info.time,
      tags: game.info.opening
        ? {
            connectOrCreate: {
              where: { name: game.info.opening },
              create: { name: game.info.opening }
            }
          }
        : undefined
    }
  })
}

/**
 * 対局一覧APIからデータ書き込み
 * @param env
 * @param game
 * @returns
 */
export const upsertGame = async (env: Env, game: Game) => {
  return await env.PRISMA.game.upsert({
    where: { id: game.game_id },
    create: {
      id: game.game_id,
      moves: game.moves,
      title: game.title,
      date: dayjs(game.start_time).format('YYYY/MM/DD'),
      black: {
        connectOrCreate: {
          where: { name: game.black.name },
          create: { name: game.black.name }
        }
      },
      blackRank: game.black.rank, // 対局時の段級位
      white: {
        connectOrCreate: {
          where: { name: game.white.name },
          create: { name: game.white.name }
        }
      },
      whiteRank: game.white.rank, // 対局時の段級位
      tournament: game.tournament,
      startTime: dayjs(game.start_time).toDate(),
      endTime: game.end_time ? dayjs(game.end_time).toDate() : undefined
    },
    update: {
      moves: game.moves,
      tournament: game.tournament,
      blackRank: game.black.rank, // 対局時の段級位
      black: {
        connectOrCreate: {
          where: { name: game.black.name },
          create: { name: game.black.name }
        }
      },
      white: {
        connectOrCreate: {
          where: { name: game.white.name },
          create: { name: game.white.name }
        }
      },
      whiteRank: game.white.rank, // 対局時の段級位
      endTime: game.end_time ? dayjs(game.end_time).toDate() : undefined
    }
  })
}
