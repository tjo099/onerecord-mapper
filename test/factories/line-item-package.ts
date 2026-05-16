import type { LineItemPackage } from '../../src/classes/line-item-package/schema.js'
import { envelope } from './common.js'

export type LineItemPackageFactoryShape = LineItemPackage

export function createLineItemPackage(
  overrides: Partial<LineItemPackageFactoryShape> = {},
): LineItemPackageFactoryShape {
  return {
    ...envelope('LineItemPackage'),
    '@type': 'LineItemPackage',
    packageSlac: 1,
    ...overrides,
  } as LineItemPackageFactoryShape
}
