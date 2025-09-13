import type { Game } from '@mito-shogi/tsshogi-jsa'
import dayjs from 'dayjs'
import type { Env } from './bindings'

export const upsertGame = async (env: Env, game: Game) => {
  await env.PRISMA.game.upsert({
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
