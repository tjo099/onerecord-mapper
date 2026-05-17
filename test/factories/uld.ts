import type { ULD } from '../../src/classes/uld/schema.js'
import { envelope } from './common.js'

export type ULDFactoryShape = ULD

export function createULD(overrides: Partial<ULDFactoryShape> = {}): ULDFactoryShape {
  return {
    ...envelope('ULD'),
    '@type': 'ULD',
    uldTypeCode: 'AKE',
    ...overrides,
  } as ULDFactoryShape
}
