import { envelope } from './common.js'

export interface VerificationFactoryShape {
  '@context': string
  '@type': 'Verification'
  '@id': string
  verificationStatus?: string
  verificationFor: string
}

export function createVerification(
  overrides: Partial<VerificationFactoryShape> = {},
): VerificationFactoryShape {
  return {
    ...envelope('Verification'),
    '@type': 'Verification',
    verificationStatus: 'VERIFIED',
    verificationFor: 'https://example/logistics-object/waybill/1',
    ...overrides,
  } as VerificationFactoryShape
}
