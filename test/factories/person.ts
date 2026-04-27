import type { Person } from '../../src/classes/person/schema.js'
import { envelope } from './common.js'

export type PersonFactoryShape = Person

export function createPerson(overrides: Partial<PersonFactoryShape> = {}): PersonFactoryShape {
  return {
    ...envelope('Person'),
    '@type': 'Person',
    firstName: 'Alice',
    lastName: 'Example',
    ...overrides,
  } as PersonFactoryShape
}
