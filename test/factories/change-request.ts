import type { ChangeRequest } from '../../src/classes/change-request/schema.js'
import { envelope } from './common.js'

export type ChangeRequestFactoryShape = ChangeRequest

export function createChangeRequest(
  overrides: Partial<ChangeRequestFactoryShape> = {},
): ChangeRequestFactoryShape {
  return {
    ...envelope('ChangeRequest'),
    '@type': 'ChangeRequest',
    forLogisticsObject: 'https://example.org/waybill/123',
    hasChange: 'https://example.org/change/456',
    requestStatus: 'REQUEST_PENDING',
    ...overrides,
  } as ChangeRequestFactoryShape
}
