import type { MovementTime } from '../../src/classes/movement-time/schema.js'
import { envelope } from './common.js'

export type MovementTimeFactoryShape = MovementTime

export function createMovementTime(
  overrides: Partial<MovementTimeFactoryShape> = {},
): MovementTimeFactoryShape {
  return {
    ...envelope('MovementTime'),
    '@type': 'MovementTime',
    movementTimeType: 'SCHEDULED',
    direction: 'OUTBOUND',
    movementTimestamp: '2026-01-01T12:00:00.000Z',
    ...overrides,
  } as MovementTimeFactoryShape
}
