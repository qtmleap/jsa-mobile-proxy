import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import { JWTPayloadSchema } from '../models/jwt.dto'
import type { Env } from '../utils/bindings'

// オプショナル JWT認証 (JWTがない場合はゲスト扱い)
export const authJWT: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  // クッキーまたはAuthorizationヘッダーからJWTを取得
  const token: string | undefined = getCookie(c, 'accessToken') || c.req.header('Authorization')?.replace('Bearer ', '')
  if (token !== undefined) {
    const payload = JWTPayloadSchema.parse(await verify(token, c.env.JWT_SECRET_KEY, 'HS256'))
    c.env.PLAN_ID = payload.pid
    c.env.IS_PREMIUM = payload.pid > 0
  } else {
    c.env.PLAN_ID = 0
    c.env.IS_PREMIUM = false
  }
  await next()
}
