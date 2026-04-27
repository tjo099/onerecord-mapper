import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const SubscriptionSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Subscription'),
  topicType: z.enum(['LOGISTICS_OBJECT_TYPE', 'LOGISTICS_OBJECT_INSTANCE', 'LOGISTICS_EVENT_TYPE']),
  topic: safeIri(),
  subscriber: safeIri(),
  subscribedTo: z.array(z.enum(['OBJECT_CREATED', 'OBJECT_UPDATED', 'LOGISTICS_EVENT_RECEIVED'])),
  notificationEndpoint: safeIri(),
  secret: z.string().min(32).max(128).optional(),
}).strict()

export type Subscription = z.infer<typeof SubscriptionSchema>
export type JsonLdSubscription = JsonLd<'Subscription'>
