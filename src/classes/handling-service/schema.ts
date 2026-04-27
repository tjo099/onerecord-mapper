import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const HandlingServiceSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('HandlingService'),
  serviceType: z.string().min(1).max(70),
  provider: safeIri().optional(),
  forShipment: safeIri().optional(),
  description: z.string().max(1024).optional(),
}).strict()

export type HandlingService = z.infer<typeof HandlingServiceSchema>
export type JsonLdHandlingService = JsonLd<'HandlingService'>
