// src/classes/booking-preferences/index.ts
export { BookingPreferencesSchema } from './schema.js'
export type { BookingPreferences, JsonLdBookingPreferences } from './schema.js'
export { serializeBookingPreferences, serializeBookingPreferencesStrict } from './serialize.js'
export { deserializeBookingPreferences } from './deserialize.js'
export { BookingPreferencesCodec } from './codec.js'
