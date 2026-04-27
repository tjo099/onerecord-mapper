// src/classes/booking/codec.ts
import type { Codec } from '../shared/codec.js'
import { deserializeBooking } from './deserialize.js'
import type { Booking, JsonLdBooking } from './schema.js'
import { BookingSchema } from './schema.js'
import { serializeBooking, serializeBookingStrict } from './serialize.js'

export const BookingCodec: Codec<Booking, JsonLdBooking, 'Booking'> = Object.freeze({
  schema: BookingSchema,
  serialize: serializeBooking,
  serializeStrict: serializeBookingStrict,
  deserialize: deserializeBooking,
  type: 'Booking',
} as const)
