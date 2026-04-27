import { envelope } from './common.js'

export interface TransportMovementFactoryShape {
  '@context': string
  '@type': 'TransportMovement'
  '@id': string
  transportIdentifier: string
  modeCode: 'AIR' | 'TRUCK' | 'RAIL' | 'SEA'
  departureLocation: string
  arrivalLocation: string
}

export function createTransportMovement(
  overrides: Partial<TransportMovementFactoryShape> = {},
): TransportMovementFactoryShape {
  return {
    ...envelope('TransportMovement'),
    '@type': 'TransportMovement',
    transportIdentifier: 'WF170',
    modeCode: 'AIR',
    departureLocation: 'https://example/location/dep',
    arrivalLocation: 'https://example/location/arr',
    ...overrides,
  } as TransportMovementFactoryShape
}
