// Frozen @flaks/onerecord 0.5.0 oracle for superset tests (see README.md). Do not edit.
export { BookingSchema } from './classes/booking/schema.js'
export { serializeBooking } from './classes/booking/serialize.js'
export { BookingOptionSchema } from './classes/booking-option/schema.js'
export { serializeBookingOption } from './classes/booking-option/serialize.js'
export { BookingRequestSchema } from './classes/booking-request/schema.js'
export { serializeBookingRequest } from './classes/booking-request/serialize.js'
export {
  acceptBookingOption,
  acceptBookingOptionViaRequest,
  acceptBookingRequest,
  rejectBookingOption,
  revokeBookingOption,
} from './booking-flow/transitions.js'
