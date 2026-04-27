import { envelope } from './common.js'

export interface MovementTimeFactoryShape {
  '@context': string
  '@type': 'MovementTime'
  '@id': string
  movementTimeType: 'SCHEDULED' | 'ESTIMATED' | 'ACTUAL'
  direction: 'INBOUND' | 'OUTBOUND'
  movementTimestamp: string
}

export function createMovementTime(
  overrides: Partial<MovementTimeFactoryShape> = {},
): MovementTimeFactoryShape {
  return {
    ...envelope('MovementTime'),
    '@type': 'MovementTime',
    movementTimeType: 'SCHEDULED',
    direction: 'OUTBOUND',
    movementTimestamp: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as MovementTimeFactoryShape
}
