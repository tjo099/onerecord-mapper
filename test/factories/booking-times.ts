// test/factories/booking-times.ts
import type { BookingTimes } from '../../src/classes/booking-times/schema.js'
import { envelope } from './common.js'

export function createBookingTimes(overrides?: Partial<BookingTimes>): BookingTimes {
  return {
    ...envelope('BookingTimes'),
    requestedDeparture: '2026-03-01T08:00:00Z',
    ...overrides,
  } as BookingTimes
}
