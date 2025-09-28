import { WorkerEntrypoint } from 'cloudflare:workers'
import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@prisma/client'
import type { Env } from '@/utils/bindings'

export class PrismaService extends WorkerEntrypoint<Env> {
  getGames() {
    const adapter = new PrismaD1(this.env.DB)
    const prisma = new PrismaClient({ adapter })
    return prisma.game.findMany()
  }

  getPlayers() {
    const adapter = new PrismaD1(this.env.DB)
    const prisma = new PrismaClient({ adapter })
    return prisma.player.findMany()
  }
}
