import type { Waybill } from '../../src/classes/waybill/schema.js'
import { envelope } from './common.js'

// v3 (Task 25): WaybillFactoryShape aligned with the real Waybill schema type.
// @context broadened to string | string[] to match LogisticsObjectSchema.
// Optional schema fields added so the harness can inject test overrides.
export type WaybillFactoryShape = Waybill

export function createWaybill(overrides: Partial<WaybillFactoryShape> = {}): WaybillFactoryShape {
  return {
    ...envelope('Waybill'),
    '@type': 'Waybill',
    waybillType: 'MASTER',
    waybillPrefix: '701',
    waybillNumber: '12345675',
    ...overrides,
  } as WaybillFactoryShape
}
