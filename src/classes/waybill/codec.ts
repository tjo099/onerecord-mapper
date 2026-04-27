import type { Codec } from '../shared/codec.js'
import { deserializeWaybill } from './deserialize.js'
import type { JsonLdWaybill, Waybill } from './schema.js'
import { WaybillSchema } from './schema.js'
import { serializeWaybill, serializeWaybillStrict } from './serialize.js'

export const WaybillCodec: Codec<Waybill, JsonLdWaybill, 'Waybill'> = Object.freeze({
  schema: WaybillSchema,
  serialize: serializeWaybill,
  serializeStrict: serializeWaybillStrict,
  deserialize: deserializeWaybill,
  type: 'Waybill',
} as const)
