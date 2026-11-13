// src/classes/booking-request/schema.ts
import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

// Line citations (Lnnnn) refer to the official 2025-07-standard ontology file at
// IATA commit 49e8ac1b. :BookingRequest is at L5555.
export const BookingRequestSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('BookingRequest'),
  /** @deprecated Not a ONE Record property of BookingRequest. Removal: booking Path A (deviation #18). */
  requestStatus: z
    .enum(['REQUEST_PENDING', 'REQUEST_ACCEPTED', 'REQUEST_REJECTED', 'REQUEST_REVOKED'])
    .optional(),
  /** @deprecated Not a ONE Record property of BookingRequest. Removal: booking Path A (deviation #18). */
  requestor: safeIri().optional(),
  /** @deprecated Not a ONE Record property of BookingRequest. Removal: booking Path A (deviation #18). */
  preferences: safeIri().optional(),
  // :BookingRequest own properties
  booking: safeIri().optional(), // L378
  forBookingOption: safeIri().optional(), // L1138
  waybillNumber: z
    .string()
    .regex(/^[A-Z0-9]+$/)
    .optional(), // L4751
  waybillPrefix: z
    .string()
    .regex(/^[A-Z0-9]{1,3}$/)
    .optional(), // L4764
}).strict()

type BookingRequestInferred = z.infer<typeof BookingRequestSchema>
export type BookingRequest = Omit<
  BookingRequestInferred,
  'requestStatus' | 'requestor' | 'preferences'
> & {
  /** @deprecated Not a ONE Record property of BookingRequest. Removal: booking Path A (deviation #18). */
  requestStatus?: BookingRequestInferred['requestStatus']
  /** @deprecated Not a ONE Record property of BookingRequest. Removal: booking Path A (deviation #18). */
  requestor?: BookingRequestInferred['requestor']
  /** @deprecated Not a ONE Record property of BookingRequest. Removal: booking Path A (deviation #18). */
  preferences?: BookingRequestInferred['preferences']
}
export type JsonLdBookingRequest = JsonLd<'BookingRequest'>
