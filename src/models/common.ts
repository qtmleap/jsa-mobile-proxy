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
      }),
      totalPages: z.number().int().min(1).openapi({
        description: '総ページ数',
        example: 7
      }),
      hasNext: z.boolean().openapi({
        description: '次のページがあるかどうか',
        example: true
      }),
      hasPrev: z.boolean().openapi({
        description: '前のページがあるかどうか',
        example: false
      })
    })
    .openapi('PaginatedSchema')
