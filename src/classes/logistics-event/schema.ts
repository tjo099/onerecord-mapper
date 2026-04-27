import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const LogisticsEventSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('LogisticsEvent'),
  eventTypeCode: z.string().min(2).max(8),
  eventTimestamp: z.string().datetime({ offset: true }),
  eventLocation: safeIri().optional(),
  eventName: z.string().max(35).optional(),
  relatedTransportMovement: safeIri().optional(),
}).strict()

export type LogisticsEvent = z.infer<typeof LogisticsEventSchema>
export type JsonLdLogisticsEvent = JsonLd<'LogisticsEvent'>
