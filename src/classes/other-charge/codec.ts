import type { Codec } from '../shared/codec.js'
import { deserializeOtherCharge } from './deserialize.js'
import type { JsonLdOtherCharge, OtherCharge } from './schema.js'
import { OtherChargeSchema } from './schema.js'
import { serializeOtherCharge, serializeOtherChargeStrict } from './serialize.js'

export const OtherChargeCodec: Codec<OtherCharge, JsonLdOtherCharge, 'OtherCharge'> = Object.freeze(
  {
    schema: OtherChargeSchema,
    serialize: serializeOtherCharge,
    serializeStrict: serializeOtherChargeStrict,
    deserialize: deserializeOtherCharge,
    type: 'OtherCharge',
  } as const,
)
