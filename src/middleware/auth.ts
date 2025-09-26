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
        case c.env.PLAN_ID_LITE:
          return 1
        case c.env.PLAN_ID_BASIC:
          return 2
        default:
          return 0
      }
    })()
    c.env.PLAN_ID = pid
  } else {
    c.env.PLAN_ID = 0
  }
  await next()
}
