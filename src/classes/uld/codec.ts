import type { Codec } from '../shared/codec.js'
import { deserializeULD } from './deserialize.js'
import type { JsonLdULD, ULD } from './schema.js'
import { ULDSchema } from './schema.js'
import { serializeULD, serializeULDStrict } from './serialize.js'

export const ULDCodec: Codec<ULD, JsonLdULD, 'ULD'> = Object.freeze({
  schema: ULDSchema,
  serialize: serializeULD,
  serializeStrict: serializeULDStrict,
  deserialize: deserializeULD,
  type: 'ULD',
} as const)
