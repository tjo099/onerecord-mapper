import { z } from 'zod'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const PieceSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Piece'),
  grossWeight: z.object({ unit: z.literal('KGM'), value: z.number().nonnegative() }),
  dimensions: z
    .object({
      length: z.number().positive(),
      width: z.number().positive(),
      height: z.number().positive(),
      unit: z.literal('CMT'),
    })
    .optional(),
  goodsDescription: z.string().max(1024).optional(),
  slac: z.number().int().nonnegative().optional(),
}).strict()

export type Piece = z.infer<typeof PieceSchema>
export type JsonLdPiece = JsonLd<'Piece'>
