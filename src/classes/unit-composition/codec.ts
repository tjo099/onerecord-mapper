import type { Codec } from '../shared/codec.js'
import { deserializeUnitComposition } from './deserialize.js'
import type { JsonLdUnitComposition, UnitComposition } from './schema.js'
import { UnitCompositionSchema } from './schema.js'
import { serializeUnitComposition, serializeUnitCompositionStrict } from './serialize.js'

export const UnitCompositionCodec: Codec<UnitComposition, JsonLdUnitComposition, 'UnitComposition'> = Object.freeze({
  schema: UnitCompositionSchema,
  serialize: serializeUnitComposition,
  serializeStrict: serializeUnitCompositionStrict,
  deserialize: deserializeUnitComposition,
  type: 'UnitComposition',
} as const)
