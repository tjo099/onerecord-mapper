import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const UnitCompositionSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('UnitComposition'),
  loadingUnit: safeIri().optional(),                           // → :LoadingUnit max1
  compositionActions: z.array(safeIri()).optional(),           // → :Composing[]
  compositionIdentifier: z.string().min(1).max(64).optional(), // xsd:string max1
  slac: z.number().int().nonnegative().optional(),             // xsd:integer max1 (ULD-level SLAC)
  contactPersons: z.array(safeIri()).optional(),               // inherited :LogisticsActivity (minimal)
}).strict()

export type UnitComposition = z.infer<typeof UnitCompositionSchema>
export type JsonLdUnitComposition = JsonLd<'UnitComposition'>
