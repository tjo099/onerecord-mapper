import { PriceSchema, serializePrice } from '../../../src/classes/price/index.js'
import { createPrice } from '../../factories/price.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'Price',
  schema: PriceSchema,
  serialize: serializePrice,
  factory: createPrice,
})
