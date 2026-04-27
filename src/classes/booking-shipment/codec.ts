// src/classes/booking-shipment/codec.ts
import type { Codec } from '../shared/codec.js'
import { deserializeBookingShipment } from './deserialize.js'
import type { BookingShipment, JsonLdBookingShipment } from './schema.js'
import { BookingShipmentSchema } from './schema.js'
import { serializeBookingShipment, serializeBookingShipmentStrict } from './serialize.js'

export const BookingShipmentCodec: Codec<
  BookingShipment,
  JsonLdBookingShipment,
  'BookingShipment'
> = Object.freeze({
  schema: BookingShipmentSchema,
  serialize: serializeBookingShipment,
  serializeStrict: serializeBookingShipmentStrict,
  deserialize: deserializeBookingShipment,
  type: 'BookingShipment',
} as const)
