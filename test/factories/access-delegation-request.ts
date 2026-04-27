import { envelope } from './common.js'

export interface AccessDelegationRequestFactoryShape {
  '@context': string
  '@type': 'AccessDelegationRequest'
  '@id': string
  delegateTo: string
  forLogisticsObject: string
}

export function createAccessDelegationRequest(
  overrides: Partial<AccessDelegationRequestFactoryShape> = {},
): AccessDelegationRequestFactoryShape {
  return {
    ...envelope('AccessDelegationRequest'),
    '@type': 'AccessDelegationRequest',
    delegateTo: 'https://example/organization/delegate',
    forLogisticsObject: 'https://example/logistics-object/waybill/1',
    ...overrides,
  } as AccessDelegationRequestFactoryShape
}
