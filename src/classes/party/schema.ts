import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'
import { OtherIdentifierSchema } from '../shared/value.js'

const IdRef = z.union([safeIri(), z.object({ '@id': safeIri() }).strict()])

export const PartySchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Party'),
  partyRole: z.enum(['SHP', 'CNE', 'FFW', 'CAR', 'NFY', 'NI', 'AGT', 'GHA']),
  partyDetails: IdRef,
  accountNumbers: z.array(safeIri()).optional(),
  otherIdentifiers: z.array(OtherIdentifierSchema).optional(), // :Party.otherIdentifiers — verified restriction (review-fix F5) TTL:8076
}).strict()

export type Party = z.infer<typeof PartySchema>
export type JsonLdParty = JsonLd<'Party'>
