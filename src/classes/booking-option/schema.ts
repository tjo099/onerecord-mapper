// src/classes/booking-option/schema.ts
import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const BookingOptionSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('BookingOption'),
  forBookingRequest: safeIri(),
  optionStatus: z.enum(['OPTION_PROPOSED', 'OPTION_ACCEPTED', 'OPTION_REJECTED']),
  expiresAt: z.string().datetime({ offset: true }).optional(),
  preferences: safeIri().optional(),
}).strict()

export type BookingOption = z.infer<typeof BookingOptionSchema>
export type JsonLdBookingOption = JsonLd<'BookingOption'>
