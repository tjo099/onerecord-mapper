// test/factories/booking-shipment.ts
import type { BookingShipment } from '../../src/classes/booking-shipment/schema.js'
import { envelope, testIri } from './common.js'

const FIXED_SHIPMENT_UUID = '00000000-0000-0000-0000-000000000004'

export function createBookingShipment(overrides?: Partial<BookingShipment>): BookingShipment {
  return {
    ...envelope('BookingShipment'),
    forShipment: testIri('Shipment', FIXED_SHIPMENT_UUID),
    pieceCount: 2,
    ...overrides,
  } as BookingShipment
}
