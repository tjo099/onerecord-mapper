import { envelope } from './common.js'

export interface BookingPreferencesFactoryShape {
  '@context': string
  '@type': 'BookingPreferences'
  '@id': string
  preferredCarrier?: string
  preferredRoute?: string
}

export function createBookingPreferences(
  overrides: Partial<BookingPreferencesFactoryShape> = {},
): BookingPreferencesFactoryShape {
  return {
    ...envelope('BookingPreferences'),
    '@type': 'BookingPreferences',
    preferredCarrier: 'WF',
    preferredRoute: 'AMS-JFK',
    ...overrides,
  } as BookingPreferencesFactoryShape
}
