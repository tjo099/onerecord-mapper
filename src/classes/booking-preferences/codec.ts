// src/classes/booking-preferences/codec.ts
import type { Codec } from '../shared/codec.js'
import { deserializeBookingPreferences } from './deserialize.js'
import type { BookingPreferences, JsonLdBookingPreferences } from './schema.js'
import { BookingPreferencesSchema } from './schema.js'
import { serializeBookingPreferences, serializeBookingPreferencesStrict } from './serialize.js'

export const BookingPreferencesCodec: Codec<
  BookingPreferences,
  JsonLdBookingPreferences,
  'BookingPreferences'
> = Object.freeze({
  schema: BookingPreferencesSchema,
  serialize: serializeBookingPreferences,
  serializeStrict: serializeBookingPreferencesStrict,
  deserialize: deserializeBookingPreferences,
  type: 'BookingPreferences',
} as const)
