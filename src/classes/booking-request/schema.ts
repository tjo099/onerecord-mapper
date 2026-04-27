// src/classes/booking-request/schema.ts
import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

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
