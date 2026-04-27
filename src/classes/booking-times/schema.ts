// src/classes/booking-times/schema.ts
import { z } from 'zod'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const BookingTimesSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('BookingTimes'),
  requestedDeparture: z.string().datetime({ offset: true }).optional(),
  requestedArrival: z.string().datetime({ offset: true }).optional(),
  latestPickup: z.string().datetime({ offset: true }).optional(),
}).strict()

export type BookingTimes = z.infer<typeof BookingTimesSchema>
export type JsonLdBookingTimes = JsonLd<'BookingTimes'>
