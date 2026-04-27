import type { Change } from '../../src/classes/change/schema.js'
import { envelope, testIri } from './common.js'

export type ChangeFactoryShape = Change

export function createChange(overrides: Partial<ChangeFactoryShape> = {}): ChangeFactoryShape {
  return {
    ...envelope('Change'),
    '@type': 'Change',
    hasOperation: [
      {
        '@context': 'https://onerecord.iata.org/ns/cargo',
        '@type': 'Operation',
        '@id': testIri('Operation', '00000000-0000-0000-0000-000000000001'),
        op: 'ADD',
        path: '/waybillType',
        value: 'HOUSE',
      },
    ],
    ...overrides,
  } as ChangeFactoryShape
}
