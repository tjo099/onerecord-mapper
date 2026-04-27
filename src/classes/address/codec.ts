import type { Codec } from '../shared/codec.js'
import { deserializeAddress } from './deserialize.js'
import type { Address, JsonLdAddress } from './schema.js'
import { AddressSchema } from './schema.js'
import { serializeAddress, serializeAddressStrict } from './serialize.js'

export const AddressCodec: Codec<Address, JsonLdAddress, 'Address'> = Object.freeze({
  schema: AddressSchema,
  serialize: serializeAddress,
  serializeStrict: serializeAddressStrict,
  deserialize: deserializeAddress,
  type: 'Address',
} as const)
