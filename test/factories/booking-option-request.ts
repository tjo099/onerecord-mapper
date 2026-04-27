import { envelope } from './common.js'

export interface BookingOptionRequestFactoryShape {
  '@context': string
  '@type': 'BookingOptionRequest'
  '@id': string
  requestedFor: string
  requestor?: string
}

export function createBookingOptionRequest(
  overrides: Partial<BookingOptionRequestFactoryShape> = {},
): BookingOptionRequestFactoryShape {
  return {
    ...envelope('BookingOptionRequest'),
    '@type': 'BookingOptionRequest',
    requestedFor: 'https://example/booking-request/1',
    requestor: 'https://example/organization/forwarder',
    ...overrides,
  } as BookingOptionRequestFactoryShape
}
