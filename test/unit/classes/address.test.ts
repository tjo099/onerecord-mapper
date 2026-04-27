import {
  AddressCodec,
  AddressSchema,
  deserializeAddress,
  serializeAddress,
  serializeAddressStrict,
} from '../../../src/classes/address/index.js'
import { createAddress } from '../../factories/address.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'Address',
  schema: AddressSchema,
  serialize: serializeAddress,
  serializeStrict: serializeAddressStrict,
  deserialize: deserializeAddress,
  codec: AddressCodec,
  factory: createAddress,
  emptyArrayField: 'streetAddressLines',
})
