import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'
import { CurrencyValueSchema } from '../shared/value.js'

export const WaybillSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Waybill'),
  waybillType: z.enum(['MASTER', 'HOUSE', 'DIRECT']),
  waybillPrefix: z.string().regex(/^[A-Z0-9]{1,3}$/),
  waybillNumber: z.string().regex(/^[A-Z0-9]+$/),
  shipment: safeIri().optional(),
  departureLocation: safeIri().optional(),
  arrivalLocation: safeIri().optional(),
  involvedParties: z.array(safeIri()).optional(),
  waybillLineItems: z.array(safeIri()).optional(),
  otherCharges: z.array(safeIri()).optional(),
  declaredValueForCarriage: CurrencyValueSchema.optional(),
  declaredValueForCustoms: CurrencyValueSchema.optional(),
  destinationCharges: z.array(CurrencyValueSchema).optional(),
  carrierDeclarationDate: z.string().datetime().optional(),
  carrierDeclarationPlace: safeIri().optional(),
  carrierDeclarationSignature: z.string().min(1).max(256).optional(),
  consignorDeclarationSignature: z.string().min(1).max(256).optional(),
  // :accountingInformation is owl:deprecated in 3.2-rc2 (line 2861) — see
  // spec-deviations.md #15; non-deprecated path is accountingNotes→AccountingNote (deferred).
  accountingInformation: z.string().min(1).max(512).optional(),
  houseWaybills: z.array(safeIri()).optional(),
  masterWaybill: safeIri().optional(),
  shippingRefNo: z.string().min(1).max(64).optional(),
  carrierChargeCode: z.string().min(1).max(16).optional(),
  weightValuationIndicator: z.enum(['P', 'C']).optional(),
  otherChargesIndicator: z.enum(['P', 'C']).optional(), // :Waybill →codes:PrepaidCollectIndicator — FWB OTH waybill-level PP/CC
  taxAmount: CurrencyValueSchema.optional(), // :Waybill →:CurrencyValue
  billingDetails: safeIri().optional(),
  referredBookingOption: safeIri().optional(),
}).strict()

export type Waybill = z.infer<typeof WaybillSchema>
export type JsonLdWaybill = JsonLd<'Waybill'>
