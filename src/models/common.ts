import z, { type ZodType } from 'zod'

export const ListSchema = <T extends ZodType>(S: T) => z.array(S)
