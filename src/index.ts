import { WorkerEntrypoint } from 'cloudflare:workers'
import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@prisma/client'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { HTTPException } from 'hono/http-exception'
import { exportJKF, importJKFString, type Record } from 'tsshogi'
import { ListSchema } from './models/common.dto'
import { type GameRequestParams, type GameRequestQuery, GameSchema } from './models/game.dto'
import { JKFSchema } from './models/jkf.dto'
import type { Env } from './utils/bindings'
import queue from './utils/queue'
import scheduled from './utils/scheduled'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isToday)
dayjs.tz.setDefault('Asia/Tokyo')

export class PrismaService extends WorkerEntrypoint<Env> {
  async getGame(params: GameRequestParams) {
    const { game_id, plan_id } = params
    const adapter = new PrismaD1(this.env.DB)
    const prisma = new PrismaClient({ adapter })
    const game = await prisma.game.findUnique({
      where: { id: game_id },
      select: {
        id: true,
        moves: true,
        title: true,
        startTime: true,
        endTime: true,
        blackId: true,
        whiteId: true,
        timeLimit: true,
        tournament: true,
        location: true,
        kif: true,
        tags: true
      }
    })
    if (game === null) {
      // 見つからなかったときは404
      throw new HTTPException(404, { message: 'Not Found' })
    }
    if (game.endTime === null) {
      // 終了していない対局は閲覧禁止
      throw new HTTPException(403, { message: 'Forbidden' })
    }
    if (dayjs(game.startTime).isBefore(dayjs().subtract(1, 'month')) && plan_id <= 0) {
      // フリープランは一ヶ月より前は閲覧禁止
      throw new HTTPException(403, { message: 'Forbidden' })
    }
    if (dayjs(game.startTime).isBefore(dayjs().subtract(1, 'year')) && plan_id <= 1) {
      // ライトプランは一年より前は閲覧禁止
      throw new HTTPException(403, { message: 'Forbidden' })
    }
    if (game.kif === null) {
      const result = GameSchema.safeParse({
        ...game,
        kif: null,
        tags: game.tags.map((tag) => tag.name)
      })
      if (!result.success) {
        throw result.error
      }
      return result.data
    }
    const record: Record | Error = importJKFString(game.kif)
    if (record instanceof Error) {
      throw new HTTPException(500, { message: 'Failed to parse KIF data' })
    }
    const result = GameSchema.safeParse({
      ...game,
      kif: JKFSchema.parse(exportJKF(record)),
      tags: game.tags.map((tag) => tag.name)
    })
    if (!result.success) {
      throw result.error
    }
    return result.data
  }

  async getGames(params: GameRequestQuery) {
    const adapter = new PrismaD1(this.env.DB)
    const prisma = new PrismaClient({ adapter })
    const { page, limit, tournament, startTime, endTime, player } = params
    const condition = {
      ...(startTime || endTime
        ? {
            startTime: {
              ...(startTime && { gte: startTime }),
              ...(endTime && { lte: endTime })
            }
          }
        : {}),
      tournament: {
        equals: tournament
      },
      ...(player
        ? {
            OR: [{ blackId: player }, { whiteId: player }]
          }
        : {})
    }
    const [games, count] = await Promise.all([
      prisma.game.findMany({
        orderBy: { startTime: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        select: {
          id: true,
          moves: true,
          title: true,
          startTime: true,
          endTime: true,
          blackId: true,
          whiteId: true,
          timeLimit: true,
          tournament: true,
          location: true,
          tags: true
        },
        where: condition
      }),
      prisma.game.count({
        where: condition
      })
    ])
    const result = ListSchema(GameSchema).safeParse(games.map((game) => ({ ...game, tags: game.tags.map((tag) => tag.name) })))
    if (!result.success) {
      throw result.error
    }
    return {
      results: result.data,
      count: count,
      page: page,
      limit: limit
    }
  }

  async getPlayers() {
    const adapter = new PrismaD1(this.env.DB)
    const prisma = new PrismaClient({ adapter })
    const players = await prisma.player.findMany()
    return {
      results: players,
      count: players.length,
      page: 1,
      limit: players.length
    }
  }
}

export default {
  port: 28787,
  fetch: app.fetch,
  scheduled: scheduled,
  queue: queue
}
