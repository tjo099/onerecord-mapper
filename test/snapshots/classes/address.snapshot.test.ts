import { AddressSchema, serializeAddress } from '../../../src/classes/address/index.js'
import { createAddress } from '../../factories/address.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'Address',
  schema: AddressSchema,
  serialize: serializeAddress,
  factory: createAddress,
})
