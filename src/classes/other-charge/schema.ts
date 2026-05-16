import { z } from 'zod'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'
import { CurrencyValueSchema } from '../shared/value.js'

export const OtherChargeSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('OtherCharge'),
  otherChargeCode: z.string().min(1).max(16).optional(),
  otherChargeAmount: CurrencyValueSchema.optional(),
  chargePaymentType: z.enum(['P', 'C']).optional(),
  entitlement: z.enum(['C', 'A']).optional(),
  chargeQuantity: z.number().optional(),
  locationIndicator: z.string().min(1).max(64).optional(),
  reasonDescription: z.string().min(1).max(256).optional(),
}).strict()

export type OtherCharge = z.infer<typeof OtherChargeSchema>
export type JsonLdOtherCharge = JsonLd<'OtherCharge'>
