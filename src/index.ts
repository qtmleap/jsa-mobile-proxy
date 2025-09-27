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
import { HTTPException } from 'hono/http-exception'
import type { JwtVariables } from 'hono/jwt'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { timeout } from 'hono/timeout'
import { trimTrailingSlash } from 'hono/trailing-slash'
import { ZodError } from 'zod'
import ai from './api/ai/games'
import games from './api/games'
import players from './api/players'
import search from './api/search'
import tags from './api/tags'
import type { Env } from './utils/bindings'
import { createClient } from './utils/client'
import scheduled from './utils/handler'
import { reference, specification } from './utils/openapi'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isToday)
dayjs.tz.setDefault('Asia/Tokyo')

const app = new Hono<{ Bindings: Env; Variables: JwtVariables }>({ strict: false })

app.use(trimTrailingSlash())
app.use('*', async (c: Context<{ Bindings: Env; Variables: JwtVariables }>, next) => {
  const adapter = new PrismaD1(c.env.DB)
  c.env.PRISMA = new PrismaClient({ adapter })
  c.env.CLIENT = createClient(c.env)
  await next()
})
app.use('*', timeout(5000))
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'https://jsam.qleap.jp', 'https://jsam-dev.qleap.jp'],
    credentials: true,
    maxAge: 86400
  })
)
app.use(
  '*',
  secureHeaders({
    xFrameOptions: false,
    xXssProtection: false
  })
)
// app.use((c: Context, next) =>
//   rateLimiter({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
//     standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
//     keyGenerator: (c) =>
//       c.req.header('x-forwarded-for') || c.req.header('CF-Connecting-IP') || c.req.header('X-Real-IP') || 'unknown' // Method to generate custom identifiers for clients.
//     // store: new WorkersKVStore({ namespace: c.env.RATE_LIMITTER })
//     // store: ... , // Redis, MemoryStore, etc. See below.
//   })(c, next)
// )
app.use(csrf())
app.use(logger())
app.use(compress({ encoding: 'deflate' }))
app.route('/api/search', search)
app.route('/api/games', games)
app.route('/api/players', players)
app.route('/api/tags', tags)
app.route('/api/ai/games', ai)
app.doc31('/openapi.json', specification)
app.get('/docs', Scalar(reference))
app.notFound((c) => c.redirect('/docs'))
app.onError(async (error, c) => {
  if (error instanceof HTTPException) {
    return c.json({ message: error.message }, error.status)
  }
  if (error instanceof ZodError) {
    return c.json({ message: JSON.parse(error.message), description: error.cause }, 500)
  }
  if (error.name === 'PrismaClientValidationError') {
    return c.json({ message: error.message }, 500)
  }
  console.error(error.name)
  return c.json({ message: error.message }, 500)
})

export default {
  port: 28787,
  fetch: app.fetch,
  scheduled: scheduled
}
