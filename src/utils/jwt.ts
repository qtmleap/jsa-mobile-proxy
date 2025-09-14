import z from 'zod'

// JWT標準クレーム
export const JWTPayloadSchema = z.object({
  // 標準クレーム
  sub: z.string(), // Subject (ユーザーID)
  iat: z.number(), // Issued at (発行時刻のUNIXタイムスタンプ)
  exp: z.number(), // Expires (有効期限のUNIXタイムスタンプ)
  iss: z.string().optional(), // Issuer (発行者)
  aud: z.string().optional(), // Audience (対象者)
  // カスタムクレーム
  uid: z.string(),
  pid: z.number().int().positive() // Plan ID (整数値のプランID)
})

// JWTヘッダー用のスキーマ
export const JWTHeaderSchema = z.object({
  alg: z.enum(['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512']).default('HS256'), // 対称鍵をデフォルトに
  typ: z.string().default('JWT') // トークンタイプ
})

// JWT全体の構造
export const JWTSchema = z.object({
  header: JWTHeaderSchema,
  payload: JWTPayloadSchema,
  signature: z.string()
})

// 型定義をエクスポート
export type JWTPayload = z.infer<typeof JWTPayloadSchema>
export type JWTHeader = z.infer<typeof JWTHeaderSchema>
export type JWT = z.infer<typeof JWTSchema>
