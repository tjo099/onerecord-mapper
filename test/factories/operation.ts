import { envelope } from './common.js'

export interface OperationFactoryShape {
  '@context': string
  '@type': 'Operation'
  '@id': string
  operationType: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'
  o: string
}

export function createOperation(
  overrides: Partial<OperationFactoryShape> = {},
): OperationFactoryShape {
  return {
    ...envelope('Operation'),
    '@type': 'Operation',
    operationType: 'replace',
    o: 'https://example/logistics-object/waybill/1',
    ...overrides,
  } as OperationFactoryShape
}
