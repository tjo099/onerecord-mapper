// FROZEN ORACLE: verbatim `git show v0.5.0:src/classes/booking-option-request/schema.ts`; only relative imports to unchanged shared modules were repointed to src/. Do not edit.
// src/classes/booking-option-request/schema.ts
import { z } from 'zod'
import type { JsonLd } from '../../../../../src/classes/shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../../../../../src/classes/shared/logistics-object.js'
import { safeIri } from '../../../../../src/iri/zod-safe-iri.js'

export const BookingOptionRequestSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('BookingOptionRequest'),
  requestStatus: z.enum([
    'REQUEST_PENDING',
    'REQUEST_ACCEPTED',
    'REQUEST_REJECTED',
    'REQUEST_REVOKED',
  ]),
  forBookingOption: safeIri(),
}).strict()

export type BookingOptionRequest = z.infer<typeof BookingOptionRequestSchema>
export type JsonLdBookingOptionRequest = JsonLd<'BookingOptionRequest'>
