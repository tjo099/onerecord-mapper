import { envelope } from './common.js'

export interface AddressFactoryShape {
  '@context': string
  '@type': 'Address'
  '@id': string
  streetAddressLines: string[]
  cityName: string
  country: { countryCode: string }
}

export function createAddress(overrides: Partial<AddressFactoryShape> = {}): AddressFactoryShape {
  return {
    ...envelope('Address'),
    '@type': 'Address',
    streetAddressLines: ['123 Cargo Way'],
    cityName: 'Amsterdam',
    country: { countryCode: 'NL' },
    ...overrides,
  } as AddressFactoryShape
}
