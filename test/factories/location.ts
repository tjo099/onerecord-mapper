import { envelope } from './common.js'

export interface LocationFactoryShape {
  '@context': string
  '@type': 'Location'
  '@id': string
  locationCodeType: 'IATA' | 'UNLOCODE' | 'ICAO'
  locationCode: string
}

export function createLocation(
  overrides: Partial<LocationFactoryShape> = {},
): LocationFactoryShape {
  return {
    ...envelope('Location'),
    '@type': 'Location',
    locationCodeType: 'IATA',
    locationCode: 'AMS',
    ...overrides,
  } as LocationFactoryShape
}
