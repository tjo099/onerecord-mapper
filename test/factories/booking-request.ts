// test/factories/booking-request.ts
import type { BookingRequest } from '../../src/classes/booking-request/schema.js'
import { envelope, testIri } from './common.js'

const FIXED_ORG_UUID = '00000000-0000-0000-0000-000000000003'

export function createBookingRequest(overrides?: Partial<BookingRequest>): BookingRequest {
  return {
    ...envelope('BookingRequest'),
    requestStatus: 'REQUEST_PENDING',
    requestor: testIri('Organization', FIXED_ORG_UUID),
    ...overrides,
  } as BookingRequest
}
