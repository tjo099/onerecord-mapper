// src/classes/booking-option-request/schema.ts
import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

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
