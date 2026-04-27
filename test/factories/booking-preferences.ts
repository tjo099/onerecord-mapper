// test/factories/booking-preferences.ts
import type { BookingPreferences } from '../../src/classes/booking-preferences/schema.js'
import { envelope } from './common.js'

export function createBookingPreferences(
  overrides?: Partial<BookingPreferences>,
): BookingPreferences {
  return {
    ...envelope('BookingPreferences'),
    preferredCarrier: 'LH',
    ...overrides,
  } as BookingPreferences
}
