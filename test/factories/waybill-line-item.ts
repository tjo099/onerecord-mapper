import type { WaybillLineItem } from '../../src/classes/waybill-line-item/schema.js'
import { envelope } from './common.js'
export type WaybillLineItemFactoryShape = WaybillLineItem
export function createWaybillLineItem(
  overrides: Partial<WaybillLineItemFactoryShape> = {},
): WaybillLineItemFactoryShape {
  return {
    ...envelope('WaybillLineItem'),
    '@type': 'WaybillLineItem',
    lineItemNumber: 1,
    ...overrides,
  } as WaybillLineItemFactoryShape
}
