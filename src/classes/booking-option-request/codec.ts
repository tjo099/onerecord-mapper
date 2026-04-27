// src/classes/booking-option-request/codec.ts
import type { Codec } from '../shared/codec.js'
import { deserializeBookingOptionRequest } from './deserialize.js'
import type { BookingOptionRequest, JsonLdBookingOptionRequest } from './schema.js'
import { BookingOptionRequestSchema } from './schema.js'
import { serializeBookingOptionRequest, serializeBookingOptionRequestStrict } from './serialize.js'

export const BookingOptionRequestCodec: Codec<
  BookingOptionRequest,
  JsonLdBookingOptionRequest,
  'BookingOptionRequest'
> = Object.freeze({
  schema: BookingOptionRequestSchema,
  serialize: serializeBookingOptionRequest,
  serializeStrict: serializeBookingOptionRequestStrict,
  deserialize: deserializeBookingOptionRequest,
  type: 'BookingOptionRequest',
} as const)
