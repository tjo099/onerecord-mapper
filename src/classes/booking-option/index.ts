// src/classes/booking-option/index.ts
export { BookingOptionSchema } from './schema.js'
export type { BookingOption, JsonLdBookingOption } from './schema.js'
export { serializeBookingOption, serializeBookingOptionStrict } from './serialize.js'
export { deserializeBookingOption } from './deserialize.js'
export { BookingOptionCodec } from './codec.js'
