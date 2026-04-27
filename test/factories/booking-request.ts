import { envelope } from './common.js'

export interface BookingRequestFactoryShape {
  '@context': string
  '@type': 'BookingRequest'
  '@id': string
  requestor: string
  requestedBy?: string
}

export function createBookingRequest(
  overrides: Partial<BookingRequestFactoryShape> = {},
): BookingRequestFactoryShape {
  return {
    ...envelope('BookingRequest'),
    '@type': 'BookingRequest',
    requestor: 'https://example/organization/forwarder',
    requestedBy: 'https://example/person/agent',
    ...overrides,
  } as BookingRequestFactoryShape
}
