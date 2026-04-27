import { envelope } from './common.js'

export interface PersonFactoryShape {
  '@context': string
  '@type': 'Person'
  '@id': string
  firstName: string
  lastName: string
}

export function createPerson(overrides: Partial<PersonFactoryShape> = {}): PersonFactoryShape {
  return {
    ...envelope('Person'),
    '@type': 'Person',
    firstName: 'Jane',
    lastName: 'Doe',
    ...overrides,
  } as PersonFactoryShape
}
