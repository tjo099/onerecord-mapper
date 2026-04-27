import type { Operation } from '../../src/classes/operation/schema.js'
import { envelope } from './common.js'

export type OperationFactoryShape = Operation

export function createOperation(
  overrides: Partial<OperationFactoryShape> = {},
): OperationFactoryShape {
  return {
    ...envelope('Operation'),
    '@type': 'Operation',
    op: 'ADD',
    path: '/waybillType',
    value: 'HOUSE',
    ...overrides,
  } as OperationFactoryShape
}
