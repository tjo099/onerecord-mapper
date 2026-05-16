import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'
import { DimensionsSchema } from '../shared/value.js'

export const ShipmentSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Shipment'),
  // Legacy shape retained per spec-deviations.md #14 (DD-1) — :Value
  // modernisation is a separately-scheduled batch, not this release.
  totalGrossWeight: z
    .object({ unit: z.literal('KGM'), value: z.number().nonnegative() })
    .optional(),
  goodsDescription: z.string().max(1024).optional(),
  totalDimensions: DimensionsSchema.optional(),
  pieces: z.array(safeIri()).optional(),
  waybill: safeIri().optional(),
  involvedParties: z.array(safeIri()).optional(),
  customsInformation: z.array(safeIri()).optional(),
  insurance: safeIri().optional(),
  textualHandlingInstructions: z.array(z.string().min(1).max(1024)).optional(),
  incoterms: z.string().min(1).max(8).optional(),
  // Piece.securityDeclarations is 3.2.0; Shipment.securityDeclarations is
  // master-only (#344/#346) — deviation #12. Shipment carries it OPTIONALLY
  // for forward-compat acceptance only (documented), not as a 3.2.0 claim.
  securityDeclarations: z.array(safeIri()).optional(),
}).strict()

export type Shipment = z.infer<typeof ShipmentSchema>
export type JsonLdShipment = JsonLd<'Shipment'>
