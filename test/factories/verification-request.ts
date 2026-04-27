import type { VerificationRequest } from '../../src/classes/verification-request/schema.js'
import { envelope } from './common.js'

export type VerificationRequestFactoryShape = VerificationRequest

export function createVerificationRequest(
  overrides: Partial<VerificationRequestFactoryShape> = {},
): VerificationRequestFactoryShape {
  return {
    ...envelope('VerificationRequest'),
    '@type': 'VerificationRequest',
    requestStatus: 'REQUEST_PENDING',
    verification: 'https://example.org/verification/123',
    ...overrides,
  } as VerificationRequestFactoryShape
}
