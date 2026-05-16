import {
  LineItemPackageCodec,
  LineItemPackageSchema,
  deserializeLineItemPackage,
  serializeLineItemPackage,
  serializeLineItemPackageStrict,
} from '../../../src/classes/line-item-package/index.js'
import { createLineItemPackage } from '../../factories/line-item-package.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'LineItemPackage',
  schema: LineItemPackageSchema,
  serialize: serializeLineItemPackage,
  serializeStrict: serializeLineItemPackageStrict,
  deserialize: deserializeLineItemPackage,
  codec: LineItemPackageCodec,
  factory: createLineItemPackage,
})
