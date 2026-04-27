import type { Verification } from '../../src/classes/verification/schema.js'
import { envelope } from './common.js'

export type VerificationFactoryShape = Verification

export function createVerification(
  overrides: Partial<VerificationFactoryShape> = {},
): VerificationFactoryShape {
  return {
    ...envelope('Verification'),
    '@type': 'Verification',
    result: 'OK',
    verifiedObject: 'https://example.org/waybill/123',
    ...overrides,
  } as VerificationFactoryShape
}
