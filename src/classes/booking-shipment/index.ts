// src/classes/booking-shipment/index.ts
export { BookingShipmentSchema } from './schema.js'
export type { BookingShipment, JsonLdBookingShipment } from './schema.js'
export { serializeBookingShipment, serializeBookingShipmentStrict } from './serialize.js'
export { deserializeBookingShipment } from './deserialize.js'
export { BookingShipmentCodec } from './codec.js'
