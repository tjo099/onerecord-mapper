import type { TransportLegs } from '../../src/classes/transport-legs/schema.js'
import { envelope, testIri } from './common.js'

export type TransportLegsFactoryShape = TransportLegs

export function createTransportLegs(
  overrides: Partial<TransportLegsFactoryShape> = {},
): TransportLegsFactoryShape {
  return {
    ...envelope('TransportLegs'),
    '@type': 'TransportLegs',
    legNumber: 1,
    transportIdentifier: 'LH8400',
    departureDate: '2026-11-20T10:00:00Z',
    departureLocation: testIri('Location', '00000000-0000-0000-0000-000000000020'),
    arrivalLocation: testIri('Location', '00000000-0000-0000-0000-000000000021'),
    ...overrides,
  } as TransportLegsFactoryShape
}
