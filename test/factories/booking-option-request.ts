// test/factories/booking-option-request.ts
import type { BookingOptionRequest } from '../../src/classes/booking-option-request/schema.js'
import { envelope, testIri } from './common.js'

const FIXED_OPTION_UUID = '00000000-0000-0000-0000-000000000002'

export function createBookingOptionRequest(
  overrides?: Partial<BookingOptionRequest>,
): BookingOptionRequest {
  return {
    ...envelope('BookingOptionRequest'),
    requestStatus: 'REQUEST_PENDING',
    forBookingOption: testIri('BookingOption', FIXED_OPTION_UUID),
    ...overrides,
  } as BookingOptionRequest
}
