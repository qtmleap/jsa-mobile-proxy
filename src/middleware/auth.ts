import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'
import { verify } from 'hono/jwt'
import type { Env } from '../utils/bindings'
import { JWTPayloadSchema } from '../utils/jwt'

// 必須JWT認証 (従来の動作)
// export const authJWT: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
//   const jwtMiddleware = jwt({
//     secret: c.env.JWT_SECRET_KEY,
//     alg: 'HS256'
//   })
//   return jwtMiddleware(c, next)
// }

// オプショナル JWT認証 (JWTがない場合はゲスト扱い)
export const authJWT: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  // クッキーまたはAuthorizationヘッダーからJWTを取得
  const token = getCookie(c, 'accessToken') || c.req.header('Authorization')?.replace('Bearer ', '')
  if (token) {
    c.set('jwtPayload', JWTPayloadSchema.parse(await verify(token, c.env.JWT_SECRET_KEY, 'HS256')))
  } else {
    c.set('jwtPayload', null)
  }
  await next()
}
