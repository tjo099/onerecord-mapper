import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

// :Price L8623
export const PriceSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Price'),
  chargeCode: z.string().min(1).max(16).optional(), // L511 → codes:ChargeCode
  forBookingOption: safeIri().optional(), // L1138 → :BookingOption
  grandTotal: z.number().optional(), // L3536 xsd:double — the ontology defines no currency
  ratings: z.array(safeIri()).optional(), // L2106 → :Ratings, many
}).strict()

export type Price = z.infer<typeof PriceSchema>
export type JsonLdPrice = JsonLd<'Price'>
