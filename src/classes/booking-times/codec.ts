// src/classes/booking-times/codec.ts
import type { Codec } from '../shared/codec.js'
import { deserializeBookingTimes } from './deserialize.js'
import type { BookingTimes, JsonLdBookingTimes } from './schema.js'
import { BookingTimesSchema } from './schema.js'
import { serializeBookingTimes, serializeBookingTimesStrict } from './serialize.js'

export const BookingTimesCodec: Codec<BookingTimes, JsonLdBookingTimes, 'BookingTimes'> =
  Object.freeze({
    schema: BookingTimesSchema,
    serialize: serializeBookingTimes,
    serializeStrict: serializeBookingTimesStrict,
    deserialize: deserializeBookingTimes,
    type: 'BookingTimes',
  } as const)
