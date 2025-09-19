import z from 'zod'

export const MoveSchema = z
  .object({
    time: z
      .object({
        now: z.object({
          h: z.number().int().optional(),
          m: z.number().int(),
          s: z.number().int()
        }),
        total: z.object({
          h: z.number().int().optional(),
          m: z.number().int(),
          s: z.number().int()
        })
      })
      .optional(),
    move: z
      .object({
        color: z.number().int().min(0).max(1),
        piece: z.string(),
        to: z.object({
          x: z.number().int().min(1).max(9),
          y: z.number().int().min(1).max(9)
        }),
        from: z
          .object({
            x: z.number().int().min(1).max(9),
            y: z.number().int().min(1).max(9)
          })
          .optional(),
        capture: z.string().optional(),
        promote: z.boolean().optional()
      })
      .optional(),
    special: z.string().optional()
  })
  .openapi('Move')

export const JKFSchema = z
  .object({
    header: z.record(z.string(), z.string()),
    initial: z.object({
      preset: z.string()
    }),
    moves: z.array(MoveSchema)
  })
  .openapi('JKF')
