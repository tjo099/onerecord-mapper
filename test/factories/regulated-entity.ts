import type { RegulatedEntity } from '../../src/classes/regulated-entity/schema.js'
import { envelope } from './common.js'

export type RegulatedEntityFactoryShape = RegulatedEntity

export function createRegulatedEntity(
  overrides: Partial<RegulatedEntityFactoryShape> = {},
): RegulatedEntityFactoryShape {
  return {
    ...envelope('RegulatedEntity'),
    '@type': 'RegulatedEntity',
    regulatedEntityCategory: 'RA',
    regulatedEntityIdentifier: 'GB/RA/00012345-1212',
    ...overrides,
  } as RegulatedEntityFactoryShape
}
