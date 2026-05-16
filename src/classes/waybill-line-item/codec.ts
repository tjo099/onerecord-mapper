import type { Codec } from '../shared/codec.js'
import { deserializeWaybillLineItem } from './deserialize.js'
import type { JsonLdWaybillLineItem, WaybillLineItem } from './schema.js'
import { WaybillLineItemSchema } from './schema.js'
import { serializeWaybillLineItem, serializeWaybillLineItemStrict } from './serialize.js'

export const WaybillLineItemCodec: Codec<
  WaybillLineItem,
  JsonLdWaybillLineItem,
  'WaybillLineItem'
> = Object.freeze({
  schema: WaybillLineItemSchema,
  serialize: serializeWaybillLineItem,
  serializeStrict: serializeWaybillLineItemStrict,
  deserialize: deserializeWaybillLineItem,
  type: 'WaybillLineItem',
} as const)
