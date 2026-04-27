import { envelope } from './common.js'

export interface BookingShipmentFactoryShape {
  '@context': string
  '@type': 'BookingShipment'
  '@id': string
  forShipment: string
  pieceCount: number
}

export function createBookingShipment(
  overrides: Partial<BookingShipmentFactoryShape> = {},
): BookingShipmentFactoryShape {
  return {
    ...envelope('BookingShipment'),
    '@type': 'BookingShipment',
    forShipment: 'https://example/shipment/1',
    pieceCount: 1,
    ...overrides,
  } as BookingShipmentFactoryShape
}
