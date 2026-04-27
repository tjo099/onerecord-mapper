// test/factories/booking.ts
import type { Booking } from '../../src/classes/booking/schema.js'
import { envelope, testIri } from './common.js'

const FIXED_REQUEST_UUID = '00000000-0000-0000-0000-000000000001'

export function createBooking(overrides?: Partial<Booking>): Booking {
  return {
    ...envelope('Booking'),
    bookingStatus: 'REQUEST_ACCEPTED',
    forBookingRequest: testIri('BookingRequest', FIXED_REQUEST_UUID),
    ...overrides,
  } as Booking
}
