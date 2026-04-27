// src/classes/booking-request/codec.ts
import type { Codec } from '../shared/codec.js'
import { deserializeBookingRequest } from './deserialize.js'
import type { BookingRequest, JsonLdBookingRequest } from './schema.js'
import { BookingRequestSchema } from './schema.js'
import { serializeBookingRequest, serializeBookingRequestStrict } from './serialize.js'

export const BookingRequestCodec: Codec<BookingRequest, JsonLdBookingRequest, 'BookingRequest'> =
  Object.freeze({
    schema: BookingRequestSchema,
    serialize: serializeBookingRequest,
    serializeStrict: serializeBookingRequestStrict,
    deserialize: deserializeBookingRequest,
    type: 'BookingRequest',
  } as const)
