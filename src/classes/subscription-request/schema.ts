import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const SubscriptionRequestSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('SubscriptionRequest'),
  requestStatus: z.enum([
    'REQUEST_PENDING',
    'REQUEST_ACCEPTED',
    'REQUEST_REJECTED',
    'REQUEST_REVOKED',
  ]),
  subscription: safeIri(),
}).strict()

export type SubscriptionRequest = z.infer<typeof SubscriptionRequestSchema>
export type JsonLdSubscriptionRequest = JsonLd<'SubscriptionRequest'>
