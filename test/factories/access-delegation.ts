import type { AccessDelegation } from '../../src/classes/access-delegation/schema.js'
import { envelope } from './common.js'

export type AccessDelegationFactoryShape = AccessDelegation

export function createAccessDelegation(
  overrides: Partial<AccessDelegationFactoryShape> = {},
): AccessDelegationFactoryShape {
  return {
    ...envelope('AccessDelegation'),
    '@type': 'AccessDelegation',
    delegatedTo: 'https://example.org/party/delegate',
    delegatedFrom: 'https://example.org/party/owner',
    permissions: ['READ'],
    ...overrides,
  } as AccessDelegationFactoryShape
}
