import { envelope } from './common.js'

export interface BookingTimesFactoryShape {
  '@context': string
  '@type': 'BookingTimes'
  '@id': string
  requestedDeparture?: string
  requestedArrival?: string
}

export function createBookingTimes(
  overrides: Partial<BookingTimesFactoryShape> = {},
): BookingTimesFactoryShape {
  return {
    ...envelope('BookingTimes'),
    '@type': 'BookingTimes',
    requestedDeparture: '2026-01-01T10:00:00.000Z',
    requestedArrival: '2026-01-01T18:00:00.000Z',
    ...overrides,
  } as BookingTimesFactoryShape
}
