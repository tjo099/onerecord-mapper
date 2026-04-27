import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const AccessDelegationRequestSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('AccessDelegationRequest'),
  requestStatus: z.enum([
    'REQUEST_PENDING',
    'REQUEST_ACCEPTED',
    'REQUEST_REJECTED',
    'REQUEST_REVOKED',
  ]),
  accessDelegation: safeIri(),
}).strict()

export type AccessDelegationRequest = z.infer<typeof AccessDelegationRequestSchema>
export type JsonLdAccessDelegationRequest = JsonLd<'AccessDelegationRequest'>
