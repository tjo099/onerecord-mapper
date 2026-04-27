// src/classes/booking/schema.ts
import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const BookingSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Booking'),
  bookingStatus: z.enum(['REQUEST_ACCEPTED', 'REQUEST_REVOKED']),
  forBookingRequest: safeIri(),
  forBookingOption: safeIri().optional(),
}).strict()

export type Booking = z.infer<typeof BookingSchema>
export type JsonLdBooking = JsonLd<'Booking'>
