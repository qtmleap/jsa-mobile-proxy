import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import { JWTPayloadSchema } from '../models/jwt.dto'
import type { Env } from '../utils/bindings'

// オプショナル JWT認証 (JWTがない場合はゲスト扱い)
export const authJWT: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  // クッキーまたはAuthorizationヘッダーからJWTを取得
  const token: string | undefined =
    getCookie(c, 'access_token') || c.req.header('Authorization')?.replace('Bearer ', '')
  if (token !== undefined) {
    const payload = JWTPayloadSchema.parse(await verify(token, c.env.JWT_SECRET_KEY, 'HS256'))
    const pid: number = (() => {
      switch (payload.pid) {
        case undefined:
          return 0
        case 't30upkmxhokjfg':
          return 1
        case 't30voxhsglpzng':
          return 2
        default:
          return 0
      }
    })()
    c.env.PLAN_ID = pid
    c.env.IS_PREMIUM = pid > 0
  } else {
    c.env.PLAN_ID = 0
    c.env.IS_PREMIUM = false
  }
  await next()
}
