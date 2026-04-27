import { envelope } from './common.js'

export interface BookingOptionFactoryShape {
  '@context': string
  '@type': 'BookingOption'
  '@id': string
  forBookingRequest: string
  optionStatus: 'OPTION_PROPOSED' | 'OPTION_ACCEPTED' | 'OPTION_REJECTED'
}

export function createBookingOption(
  overrides: Partial<BookingOptionFactoryShape> = {},
): BookingOptionFactoryShape {
  return {
    ...envelope('BookingOption'),
    '@type': 'BookingOption',
    forBookingRequest: 'https://example/booking-request/1',
    optionStatus: 'OPTION_PROPOSED',
    ...overrides,
  } as BookingOptionFactoryShape
}
