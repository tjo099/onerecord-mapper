import type { Location } from '../../src/classes/location/schema.js'
import { envelope } from './common.js'

export type LocationFactoryShape = Location

export function createLocation(
  overrides: Partial<LocationFactoryShape> = {},
): LocationFactoryShape {
  return {
    ...envelope('Location'),
    '@type': 'Location',
    locationCodeType: 'IATA',
    locationCode: 'JFK',
    locationName: 'John F Kennedy International',
    ...overrides,
  } as LocationFactoryShape
}
