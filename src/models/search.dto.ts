import { z } from '@hono/zod-openapi'

export const SearchListRequestSchema = z
  .object({
    action: z.literal('search').default('search'),
    p1: z.coerce.number().int().default(0),
    p2: z.coerce.number().int().default(14000),
    p3: z.coerce.number().int().default(3)
  })
  .openapi('SearchListRequestSchema')

export const SearchGameRequestSchema = z
  .object({
    action: z.literal('shogi').default('shogi'),
    p1: z.number().int().default(100)
  })
  .openapi('SearchGameRequestSchema')

export const SearchRequestSchema = z
  .discriminatedUnion('action', [SearchListRequestSchema, SearchGameRequestSchema])
  .openapi('SearchRequestSchema')

export const SearchItemPlayerSchema = z
  .object({
    last_name: z.string(),
    first_name: z.string(),
    rank: z.string()
  })
  .openapi('SearchItemPlayerSchema')

export const SearchItemResponseSchema = z
  .object({
    game_id: z.number().int(),
    start_time: z.coerce.date(),
    end_time: z.coerce.date().nullable(),
    title: z.string(),
    tournament: z.string().optional(),
    moves: z.number().int(),
    black: SearchItemPlayerSchema,
    white: SearchItemPlayerSchema
  })
  .openapi('SearchItemResponseSchema')

export const SearchListResponseSchema = z
  .object({
    games: z.array(SearchItemResponseSchema),
    count: z.number().int().positive()
  })
  .openapi('SearchListResponseSchema')

export const SearchRequestParamsSchema = z
  .object({
    game_id: z.coerce.number().int().openapi({
      description: '対局ID',
      example: 100
    })
  })
  .openapi('SearchRequestParamsSchema')
