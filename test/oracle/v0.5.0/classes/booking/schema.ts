// FROZEN ORACLE: verbatim `git show v0.5.0:src/classes/booking/schema.ts`; only relative imports to unchanged shared modules were repointed to src/. Do not edit.
// src/classes/booking/schema.ts
import { z } from 'zod'
import type { JsonLd } from '../../../../../src/classes/shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../../../../../src/classes/shared/logistics-object.js'
import { safeIri } from '../../../../../src/iri/zod-safe-iri.js'

export const BookingSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Booking'),
  bookingStatus: z.enum(['REQUEST_ACCEPTED', 'REQUEST_REVOKED']),
  forBookingRequest: safeIri(),
  forBookingOption: safeIri().optional(),
}).strict()

export type Booking = z.infer<typeof BookingSchema>
export type JsonLdBooking = JsonLd<'Booking'>
