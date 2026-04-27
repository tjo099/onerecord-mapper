import { envelope } from './common.js'

export interface WaybillFactoryShape {
  '@context': string
  '@type': 'Waybill'
  '@id': string
  waybillType: 'MASTER' | 'HOUSE'
  waybillPrefix: string
  waybillNumber: string
  // Additional fields land in Task 25 once WaybillSchema is real.
}

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
