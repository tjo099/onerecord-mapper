import type { Address } from '../../src/classes/address/schema.js'
import { envelope } from './common.js'

export type AddressFactoryShape = Address

export function createAddress(overrides: Partial<AddressFactoryShape> = {}): AddressFactoryShape {
  return {
    ...envelope('Address'),
    '@type': 'Address',
    streetAddressLines: ['123 Main St'],
    cityName: 'Springfield',
    country: { countryCode: 'US' },
    ...overrides,
  } as AddressFactoryShape
}
