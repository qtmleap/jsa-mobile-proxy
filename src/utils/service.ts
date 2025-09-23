import { decodeGameList, decodeJSA, type Game, type GameInfo, importJSA } from '@mito-shogi/tsshogi-jsa'
import dayjs from 'dayjs'
import { exportJKFString, type Record } from 'tsshogi'
import type { Env } from './bindings'

export type GameBuffer = {
  buffer: Buffer
  game: Game
}

/**
 * 今回で対局が終わった対局一覧を取得する
 * @param env
 * @param games
 * @returns
 */
export const GetFinishedGameList = async (env: Env): Promise<Game[]> => {
  const games = await GetGameList(env, { p1: 0, p2: 100, p3: 1 })
  const inputs: Game[] = games.filter((game) => game.end_time !== null)
  const outputs: number[] = (
    await env.PRISMA.game.findMany({
      where: {
        id: {
          in: inputs.map((game) => game.game_id)
        },
        endTime: null
      },
      select: {
        id: true
      }
    })
  ).map((game) => game.id)
  return outputs
    .map((result) => inputs.find((input) => input.game_id === result))
    .filter((game): game is Game => game !== undefined)
}

export const GetGameList = async (env: Env, params: { p1: number; p2: number; p3: number }): Promise<Game[]> => {
  const { games } = decodeGameList(
    await env.CLIENT.get('/api/index.php', {
      queries: {
        // @ts-ignore
        action: 'search',
        p1: params.p1,
        p2: params.p2,
        p3: params.p3
      }
    })
  )
  console.log(`Fetched ${games.length} games from API.`)
  return games
}

/**
 * 対局一覧から棋譜バイナリを取得する
 * 全件取得しようとするとCloudflareの制限に引っかかるので注意
 * @param env
 * @param params
 * @returns
 */
export const GetGameBufferList = async (
  env: Env,
  params: { p1: number; p2: number; p3: number }
): Promise<GameBuffer[]> => {
  const { games } = decodeGameList(
    await env.CLIENT.get('/api/index.php', {
      queries: {
        // @ts-ignore
        action: 'search',
        p1: params.p1,
        p2: params.p2,
        p3: params.p3
      }
    })
  )
  console.log(`Fetched ${games.length} games from API.`)
  return await Promise.all(
    games.map(async (game) => ({
      buffer: await env.CLIENT.get(`/api/index.php`, {
        queries: {
          // @ts-ignore
          action: 'shogi',
          p1: game.game_id,
          p2: 0,
          p3: 0
        }
      }),
      game: game
    }))
  )
}

/**
 * R2に棋譜バイナリを保存する
 * @param env
 * @param buffers
 */
export const R2Write = async (env: Env, buffers: GameBuffer[]) => {
  console.log('Writing to R2...')
  await Promise.all(
    buffers.map((buffer) => env.BUCKET.put(`bin/${buffer.game.game_id}.bin`, buffer.buffer), {
      httpMetadata: {
        contentType: 'application/octet-stream',
        contentDisposition: 'attachment'
      }
    })
  )
  console.log('Write to R2 completed.')
}

/**
 * D1に対局一覧を書き込む
 * @param env
 * @param games
 */
export const D1WriteList = async (env: Env, games: GameBuffer[]) => {
  console.log('Writing to D1...')
  for (const game of games.map((game) => game.game)) {
    await env.PRISMA.game.upsert({
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
  console.log('Write to D1 completed.')
}

/**
 * D1に対局詳細一覧を書き込む
 * @param env
 * @param games
 */
export const D1Write = async (env: Env, buffers: GameBuffer[]) => {
  console.log('Writing to D1...')
  for (const buffer of buffers) {
    const game: GameInfo = decodeJSA(buffer.buffer)
    const record: Record | Error = importJSA(buffer.buffer)
    if (record instanceof Error) {
      continue
    }
    await env.PRISMA.game.upsert({
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
    console.log('Write to D1 completed.')
  }
}
