import type { UnitComposition } from '../../src/classes/unit-composition/schema.js'
import { envelope } from './common.js'

export function createUnitComposition(overrides: Partial<UnitComposition> = {}): UnitComposition {
  return {
    ...envelope('UnitComposition'),
    '@type': 'UnitComposition',
    ...overrides,
  } as UnitComposition
}
