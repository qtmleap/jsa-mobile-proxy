import { Tournament } from '@mito-shogi/tsshogi-jsa'
import z from 'zod'

export const TournamentEnum = z.nativeEnum(Tournament).openapi('TournamentEnum')
