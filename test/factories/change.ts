import { envelope } from './common.js'

export interface ChangeFactoryShape {
  '@context': string
  '@type': 'Change'
  '@id': string
  revisedLogisticsObject: string
  hasOperation: string[]
}

export function createChange(overrides: Partial<ChangeFactoryShape> = {}): ChangeFactoryShape {
  return {
    ...envelope('Change'),
    '@type': 'Change',
    revisedLogisticsObject: 'https://example/logistics-object/waybill/1',
    hasOperation: ['https://example/operation/1'],
    ...overrides,
  } as ChangeFactoryShape
}
