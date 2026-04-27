// src/classes/booking-option/codec.ts
import type { Codec } from '../shared/codec.js'
import { deserializeBookingOption } from './deserialize.js'
import type { BookingOption, JsonLdBookingOption } from './schema.js'
import { BookingOptionSchema } from './schema.js'
import { serializeBookingOption, serializeBookingOptionStrict } from './serialize.js'

export const BookingOptionCodec: Codec<BookingOption, JsonLdBookingOption, 'BookingOption'> =
  Object.freeze({
    schema: BookingOptionSchema,
    serialize: serializeBookingOption,
    serializeStrict: serializeBookingOptionStrict,
    deserialize: deserializeBookingOption,
    type: 'BookingOption',
  } as const)
