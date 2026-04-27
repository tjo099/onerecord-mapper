// src/classes/booking-segment/codec.ts
import type { Codec } from '../shared/codec.js'
import { deserializeBookingSegment } from './deserialize.js'
import type { BookingSegment, JsonLdBookingSegment } from './schema.js'
import { BookingSegmentSchema } from './schema.js'
import { serializeBookingSegment, serializeBookingSegmentStrict } from './serialize.js'

export const BookingSegmentCodec: Codec<BookingSegment, JsonLdBookingSegment, 'BookingSegment'> =
  Object.freeze({
    schema: BookingSegmentSchema,
    serialize: serializeBookingSegment,
    serializeStrict: serializeBookingSegmentStrict,
    deserialize: deserializeBookingSegment,
    type: 'BookingSegment',
  } as const)
