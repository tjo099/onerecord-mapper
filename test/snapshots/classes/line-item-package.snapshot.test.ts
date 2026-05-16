import {
  LineItemPackageSchema,
  serializeLineItemPackage,
} from '../../../src/classes/line-item-package/index.js'
import { createLineItemPackage } from '../../factories/line-item-package.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'LineItemPackage',
  schema: LineItemPackageSchema,
  serialize: serializeLineItemPackage,
  factory: createLineItemPackage,
})
