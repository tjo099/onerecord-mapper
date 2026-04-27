import { envelope } from './common.js'

export interface AccessDelegationFactoryShape {
  '@context': string
  '@type': 'AccessDelegation'
  '@id': string
  delegateTo: string
  forLogisticsObject: string
}

export function createAccessDelegation(
  overrides: Partial<AccessDelegationFactoryShape> = {},
): AccessDelegationFactoryShape {
  return {
    ...envelope('AccessDelegation'),
    '@type': 'AccessDelegation',
    delegateTo: 'https://example/organization/delegate',
    forLogisticsObject: 'https://example/logistics-object/waybill/1',
    ...overrides,
  } as AccessDelegationFactoryShape
}
