import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const WaybillSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Waybill'),
  waybillType: z.enum(['MASTER', 'HOUSE']),
  waybillPrefix: z.string().regex(/^\d{3}$/),
  waybillNumber: z.string().regex(/^\d{8}$/),
  totalGrossWeight: z
    .object({ unit: z.literal('KGM'), value: z.number().nonnegative() })
    .optional(),
  shipmentInformation: safeIri().optional(),
  referredBookingOption: safeIri().optional(),
}).strict()

export type Waybill = z.infer<typeof WaybillSchema>
export type JsonLdWaybill = JsonLd<'Waybill'>
