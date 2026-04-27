import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const LocationSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Location'),
  locationCodeType: z.enum(['IATA', 'UNLOCODE', 'ICAO']),
  locationCode: z.string().min(3).max(5),
  locationName: z.string().max(70).optional(),
  address: safeIri().optional(),
}).strict()

export type Location = z.infer<typeof LocationSchema>
export type JsonLdLocation = JsonLd<'Location'>
