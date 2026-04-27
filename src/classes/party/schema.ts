import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const PartySchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Party'),
  partyRole: z.enum(['SHP', 'CNE', 'FFW', 'CAR', 'NFY', 'AGT', 'GHA']),
  partyDetails: safeIri(),
  accountNumbers: z.array(safeIri()).optional(),
}).strict()

export type Party = z.infer<typeof PartySchema>
export type JsonLdParty = JsonLd<'Party'>
