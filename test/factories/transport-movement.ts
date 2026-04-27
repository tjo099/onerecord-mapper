import type { TransportMovement } from '../../src/classes/transport-movement/schema.js'
import { envelope } from './common.js'

export type TransportMovementFactoryShape = TransportMovement

export function createTransportMovement(
  overrides: Partial<TransportMovementFactoryShape> = {},
): TransportMovementFactoryShape {
  return {
    ...envelope('TransportMovement'),
    '@type': 'TransportMovement',
    transportIdentifier: 'WF170',
    modeCode: 'AIR',
    departureLocation: 'https://example.org/location/dep',
    arrivalLocation: 'https://example.org/location/arr',
    ...overrides,
  } as TransportMovementFactoryShape
}
