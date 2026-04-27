// src/classes/booking/index.ts
export { BookingSchema } from './schema.js'
export type { Booking, JsonLdBooking } from './schema.js'
export { serializeBooking, serializeBookingStrict } from './serialize.js'
export { deserializeBooking } from './deserialize.js'
export { BookingCodec } from './codec.js'
