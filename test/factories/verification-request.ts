import { envelope } from './common.js'

export interface VerificationRequestFactoryShape {
  '@context': string
  '@type': 'VerificationRequest'
  '@id': string
  verificationFor: string
  requestor: string
}

export function createVerificationRequest(
  overrides: Partial<VerificationRequestFactoryShape> = {},
): VerificationRequestFactoryShape {
  return {
    ...envelope('VerificationRequest'),
    '@type': 'VerificationRequest',
    verificationFor: 'https://example/logistics-object/waybill/1',
    requestor: 'https://example/organization/requestor',
    ...overrides,
  } as VerificationRequestFactoryShape
}
