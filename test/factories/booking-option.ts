// test/factories/booking-option.ts
import type { BookingOption } from '../../src/classes/booking-option/schema.js'
import { envelope, testIri } from './common.js'

const FIXED_REQUEST_UUID = '00000000-0000-0000-0000-000000000001'

export function createBookingOption(overrides?: Partial<BookingOption>): BookingOption {
  return {
    ...envelope('BookingOption'),
    forBookingRequest: testIri('BookingRequest', FIXED_REQUEST_UUID),
    optionStatus: 'OPTION_PROPOSED',
    ...overrides,
  } as BookingOption
}
