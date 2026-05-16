import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'
import { CurrencyValueSchema, ValueSchema } from '../shared/value.js'

export const WaybillLineItemSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('WaybillLineItem'),
  lineItemNumber: z.number().int().nonnegative().optional(),
  rateGrossWeight: ValueSchema.optional(),
  chargeableWeight: ValueSchema.optional(),
  rateClassCode: z.string().min(1).max(8).optional(),
  rateClassCodeBasic: z.string().min(1).max(8).optional(),
  rateCharge: CurrencyValueSchema.optional(),
  ratePercentage: ValueSchema.optional(),
  rateVolume: ValueSchema.optional(),
  rateSlac: z.number().int().nonnegative().optional(),
  conversionFactor: z.number().optional(),
  rcp: z.string().min(1).max(16).optional(),
  uldRateClassType: z.string().min(1).max(16).optional(),
  lineItemPackages: z.array(safeIri()).optional(),
  uldReferences: z.array(safeIri()).optional(),
}).strict()

export type WaybillLineItem = z.infer<typeof WaybillLineItemSchema>
export type JsonLdWaybillLineItem = JsonLd<'WaybillLineItem'>
