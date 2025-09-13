import type { Game, GameInfo } from '@mito-shogi/tsshogi-jsa'
import dayjs from 'dayjs'
import { exportJKFString, type Record } from 'tsshogi'
import type { Env } from './bindings'

export const upsertGameInfo = async (env: Env, game: GameInfo, record: Record) => {
  return env.PRISMA.game.upsert({
    where: { id: game.info.game_id },
    create: {
      id: game.info.game_id,
      moves: game.info.length,
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
      moves: game.info.length,
      kif: exportJKFString(record),
      blackTime: game.info.time,
      whiteTime: game.info.time,
      startTime: dayjs(game.info.start_time).toDate(),
      endTime: game.info.end_time ? dayjs(game.info.end_time).toDate() : undefined,
      location: game.info.location,
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

export const upsertGame = async (env: Env, game: Game) => {
  return env.PRISMA.game.upsert({
    where: { id: game.game_id },
    create: {
      id: game.game_id,
      moves: game.length,
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
      timeLimit: 0,
      startTime: dayjs(game.start_time).toDate(),
      endTime: game.end_time ? dayjs(game.end_time).toDate() : undefined
    },
    update: {
      moves: game.length,
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
      endTime: game.end_time ? dayjs(game.end_time).toDate() : undefined
    }
  })
}
