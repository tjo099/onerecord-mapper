// src/classes/booking-option-request/index.ts
export { BookingOptionRequestSchema } from './schema.js'
export type { BookingOptionRequest, JsonLdBookingOptionRequest } from './schema.js'
export { serializeBookingOptionRequest, serializeBookingOptionRequestStrict } from './serialize.js'
export { deserializeBookingOptionRequest } from './deserialize.js'
export { BookingOptionRequestCodec } from './codec.js'
