import { envelope } from './common.js'

export interface BookingFactoryShape {
  '@context': string
  '@type': 'Booking'
  '@id': string
  bookingStatus: 'BOOKING_PROPOSED' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED'
  forBookingRequest: string
}

export function createBooking(overrides: Partial<BookingFactoryShape> = {}): BookingFactoryShape {
  return {
    ...envelope('Booking'),
    '@type': 'Booking',
    bookingStatus: 'BOOKING_PROPOSED',
    forBookingRequest: 'https://example/booking-request/1',
    ...overrides,
  } as BookingFactoryShape
}
