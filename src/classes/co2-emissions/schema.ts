import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'
import { ValueSchema } from '../shared/value.js'

export const CO2EmissionsSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('CO2Emissions'),
  calculatedEmissions: ValueSchema.optional(),
  calculationFor: safeIri().optional(),
  methodName: z.string().min(1).max(128).optional(),
  methodVersion: z.string().min(1).max(64).optional(),
}).strict()

export type CO2Emissions = z.infer<typeof CO2EmissionsSchema>
export type JsonLdCO2Emissions = JsonLd<'CO2Emissions'>
