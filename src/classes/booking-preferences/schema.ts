// src/classes/booking-preferences/schema.ts
import { z } from 'zod'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const BookingPreferencesSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('BookingPreferences'),
  preferredCarrier: z.string().max(70).optional(),
  preferredRoute: z.string().max(140).optional(),
  flexibleDates: z.boolean().optional(),
}).strict()

export type BookingPreferences = z.infer<typeof BookingPreferencesSchema>
export type JsonLdBookingPreferences = JsonLd<'BookingPreferences'>
