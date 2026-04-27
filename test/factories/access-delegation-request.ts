import type { AccessDelegationRequest } from '../../src/classes/access-delegation-request/schema.js'
import { envelope } from './common.js'

export type AccessDelegationRequestFactoryShape = AccessDelegationRequest

export function createAccessDelegationRequest(
  overrides: Partial<AccessDelegationRequestFactoryShape> = {},
): AccessDelegationRequestFactoryShape {
  return {
    ...envelope('AccessDelegationRequest'),
    '@type': 'AccessDelegationRequest',
    requestStatus: 'REQUEST_PENDING',
    accessDelegation: 'https://example.org/access-delegation/123',
    ...overrides,
  } as AccessDelegationRequestFactoryShape
}
