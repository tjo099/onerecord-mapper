import { envelope } from './common.js'

export interface ChangeRequestFactoryShape {
  '@context': string
  '@type': 'ChangeRequest'
  '@id': string
  forLogisticsObject: string
  hasChange: string
  requestStatus: 'REQUEST_PENDING' | 'REQUEST_ACCEPTED' | 'REQUEST_REJECTED' | 'REQUEST_REVOKED'
}

export function createChangeRequest(
  overrides: Partial<ChangeRequestFactoryShape> = {},
): ChangeRequestFactoryShape {
  return {
    ...envelope('ChangeRequest'),
    '@type': 'ChangeRequest',
    forLogisticsObject: 'https://example/logistics-object/waybill/1',
    hasChange: 'https://example/change/1',
    requestStatus: 'REQUEST_PENDING',
    ...overrides,
  } as ChangeRequestFactoryShape
}
