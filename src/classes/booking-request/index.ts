// src/classes/booking-request/index.ts
export { BookingRequestSchema } from './schema.js'
export type { BookingRequest, JsonLdBookingRequest } from './schema.js'
export { serializeBookingRequest, serializeBookingRequestStrict } from './serialize.js'
export { deserializeBookingRequest } from './deserialize.js'
export { BookingRequestCodec } from './codec.js'
