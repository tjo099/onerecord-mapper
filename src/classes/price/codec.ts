import type { Codec } from '../shared/codec.js'
import { deserializePrice } from './deserialize.js'
import type { JsonLdPrice, Price } from './schema.js'
import { PriceSchema } from './schema.js'
import { serializePrice, serializePriceStrict } from './serialize.js'

export const PriceCodec: Codec<Price, JsonLdPrice, 'Price'> = Object.freeze({
  schema: PriceSchema,
  serialize: serializePrice,
  serializeStrict: serializePriceStrict,
  deserialize: deserializePrice,
  type: 'Price',
} as const)
