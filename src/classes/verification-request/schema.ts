import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const VerificationRequestSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('VerificationRequest'),
  requestStatus: z.enum([
    'REQUEST_PENDING',
    'REQUEST_ACCEPTED',
    'REQUEST_REJECTED',
    'REQUEST_REVOKED',
  ]),
  verification: safeIri(),
}).strict()

export type VerificationRequest = z.infer<typeof VerificationRequestSchema>
export type JsonLdVerificationRequest = JsonLd<'VerificationRequest'>
