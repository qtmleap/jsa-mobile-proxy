import { OpenAPIHono as Hono } from '@hono/zod-openapi'
import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@prisma/client'
import { Scalar } from '@scalar/hono-api-reference'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type { Context } from 'hono'
import { compress } from 'hono/compress'
import { cors } from 'hono/cors'
import { csrf } from 'hono/csrf'
import { logger } from 'hono/logger'
import { timeout } from 'hono/timeout'
import search from './api/search'
import type { Env } from './utils/bindings'
import { createClient } from './utils/client'
import scheduled from './utils/handler'
import { reference, specification } from './utils/openapi'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isToday)
dayjs.tz.setDefault('Asia/Tokyo')

const app = new Hono<{ Bindings: Env }>()

app.use('*', async (c: Context<{ Bindings: Env }>, next) => {
  const adapter = new PrismaD1(c.env.DB)
  c.env.PRISMA = new PrismaClient({ adapter })
  c.env.CLIENT = createClient(c.env)
  await next()
})
app.use('*', timeout(5000))
app.use(
  '*',
  cors({
    origin: [],
    credentials: true,
    maxAge: 86400
  })
)
app.use(csrf())
app.use(logger())
app.use(compress({ encoding: 'deflate' }))
app.route('/api/search', search)
app.doc31('/openapi.json', specification)
app.get('/docs', Scalar(reference))
app.notFound((c) => c.redirect('/docs'))

export default {
  port: 28787,
  fetch: app.fetch,
  scheduled: scheduled
}
