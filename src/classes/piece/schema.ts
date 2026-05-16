import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'
import { OtherIdentifierSchema } from '../shared/value.js'

export const PieceSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Piece'),
  // Legacy shape retained per spec-deviations.md #14 (DD-1).
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
  specialHandlingCodes: z.array(z.string().min(1).max(8)).optional(),
  otherIdentifiers: z.array(OtherIdentifierSchema).optional(),
  ofShipment: safeIri().optional(),
  containedPieces: z.array(safeIri()).optional(),
  upid: z.string().min(1).max(128).optional(),
  packagingType: safeIri().optional(),
  securityDeclarations: z.array(safeIri()).optional(), // 3.2.0 ✓ (8259-8262)
}).strict()

export type Piece = z.infer<typeof PieceSchema>
export type JsonLdPiece = JsonLd<'Piece'>
