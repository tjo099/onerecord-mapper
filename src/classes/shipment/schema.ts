import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const ShipmentSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Shipment'),
  totalGrossWeight: z
    .object({ unit: z.literal('KGM'), value: z.number().nonnegative() })
    .optional(),
  totalVolume: z.object({ unit: z.literal('MTQ'), value: z.number().nonnegative() }).optional(),
  pieceCount: z.number().int().positive(),
  goodsDescription: z.string().max(1024).optional(),
  containedPieces: z.array(safeIri()).optional(),
  consignee: safeIri().optional(),
  shipper: safeIri().optional(),
}).strict()

export type Shipment = z.infer<typeof ShipmentSchema>
export type JsonLdShipment = JsonLd<'Shipment'>
