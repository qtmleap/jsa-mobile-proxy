import z, { type ZodType } from 'zod'

export const ListSchema = <T extends ZodType>(S: T) =>
  z.array(S).openapi('ListSchema', {
    description: 'リスト'
  })

export const PaginatedSchema = <T extends ZodType>(S: T) =>
  z
    .object({
      results: ListSchema(S),
      count: z.number().int().nonnegative().openapi({
        description: '総件数',
        example: 123
      }),
      page: z.number().int().min(1).openapi({
        description: '現在のページ番号',
        example: 1
      }),
      limit: z.number().int().min(1).openapi({
        description: '1ページあたりの件数',
        example: 20
      })
    })
    .openapi('PaginatedSchema')
