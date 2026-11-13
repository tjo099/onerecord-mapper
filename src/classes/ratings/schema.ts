import { z } from 'zod'
import { ChargeIdentifier, EntitlementCode, PrepaidCollectIndicator } from '../../codes/enums.js'
import { safeIri } from '../../iri/zod-safe-iri.js'
import { RangesSchema } from '../shared/distribution.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

// :Ratings L8966
export const RatingsSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Ratings'),
  billingChargeIdentifier: ChargeIdentifier.optional(), // L361
  chargeDescription: z.string().min(1).max(256).optional(), // L3096
  chargePaymentType: PrepaidCollectIndicator.optional(), // L519
  chargeType: ChargeIdentifier.optional(), // L527
  entitlement: EntitlementCode.optional(), // L1016
  forPrices: z.array(safeIri()).optional(), // L1176 → :Price, many
  otherChargeCode: z.string().min(1).max(16).optional(), // L1764
  priceReferenceId: z.string().min(1).max(64).optional(), // L4135
  priceSpecification: z.string().min(1).max(64).optional(), // L4143
  quantity: z.number().optional(), // L4183
  ranges: z.array(RangesSchema).optional(), // L2052 → :Ranges (embedded), many
  rcp: z.string().min(1).max(16).optional(), // L2115 → :CodeListElement
  subTotal: z.number().optional(), // L4519 xsd:double — the ontology defines no currency
}).strict()

export type Ratings = z.infer<typeof RatingsSchema>
export type JsonLdRatings = JsonLd<'Ratings'>
