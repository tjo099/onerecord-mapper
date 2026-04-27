// test/factories/booking-segment.ts
import type { BookingSegment } from '../../src/classes/booking-segment/schema.js'
import { envelope, testIri } from './common.js'

const FIXED_MOVEMENT_UUID = '00000000-0000-0000-0000-000000000005'

export function createBookingSegment(overrides?: Partial<BookingSegment>): BookingSegment {
  return {
    ...envelope('BookingSegment'),
    transportMovement: testIri('TransportMovement', FIXED_MOVEMENT_UUID),
    sequenceNumber: 1,
    ...overrides,
  } as BookingSegment
}
