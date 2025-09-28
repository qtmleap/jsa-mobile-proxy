import { z } from '@hono/zod-openapi'
import { Tournament } from '@mito-shogi/tsshogi-jsa'

export const TournamentEnum = z.enum(Tournament).openapi('TournamentEnum')
