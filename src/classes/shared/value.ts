import { z } from 'zod'

// :Value — 3.2-rc2 IATA-1R-DM-Ontology.ttl:9968-9987
// { numericalValue: xsd:double, unit: codes:MeasurementUnitCode (UNECE Rec 20 token) }
// NOTE: legacy {unit,value} on Shipment.totalGrossWeight / Piece.grossWeight is
// NOT this shape — see spec-deviations.md #14 (DD-1).
export const ValueSchema = z
  .object({
    '@type': z.literal('Value').optional(),
    numericalValue: z.number(),
    unit: z.string().min(1),
  })
  .strict()
export type Value = z.infer<typeof ValueSchema>

// :CurrencyValue — 3.2-rc2 :6221-6240 ; :currencyUnit :806-810 (ISO 4217)
export const CurrencyValueSchema = z
  .object({
    '@type': z.literal('CurrencyValue').optional(),
    numericalValue: z.number(),
    currencyUnit: z.string().min(1),
  })
  .strict()
export type CurrencyValue = z.infer<typeof CurrencyValueSchema>

// :Dimensions — 3.2-rc2 :6536-6571 ; length/width/height/volume each a :Value
export const DimensionsSchema = z
  .object({
    '@type': z.literal('Dimensions').optional(),
    length: ValueSchema.optional(),
    width: ValueSchema.optional(),
    height: ValueSchema.optional(),
    volume: ValueSchema.optional(),
  })
  .strict()
export type Dimensions = z.infer<typeof DimensionsSchema>

// :OtherIdentifier — 3.2-rc2 :8019-8038 ; :otherIdentifierType :3985-3989 (+ :textualValue :4580 verified Step 2)
export const OtherIdentifierSchema = z
  .object({
    '@type': z.literal('OtherIdentifier').optional(),
    otherIdentifierType: z.string().min(1),
    textualValue: z.string().min(1),
  })
  .strict()
export type OtherIdentifier = z.infer<typeof OtherIdentifierSchema>
