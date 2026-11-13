// FROZEN ORACLE: verbatim `git show v0.5.0:src/classes/booking-request/schema.ts`; only relative imports to unchanged shared modules were repointed to src/. Do not edit.
// src/classes/booking-request/schema.ts
import { z } from 'zod'
import type { JsonLd } from '../../../../../src/classes/shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../../../../../src/classes/shared/logistics-object.js'
import { safeIri } from '../../../../../src/iri/zod-safe-iri.js'

export const BookingRequestSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('BookingRequest'),
  requestStatus: z.enum([
    'REQUEST_PENDING',
    'REQUEST_ACCEPTED',
    'REQUEST_REJECTED',
    'REQUEST_REVOKED',
  ]),
  requestor: safeIri(),
  preferences: safeIri().optional(),
}).strict()

export type BookingRequest = z.infer<typeof BookingRequestSchema>
export type JsonLdBookingRequest = JsonLd<'BookingRequest'>
