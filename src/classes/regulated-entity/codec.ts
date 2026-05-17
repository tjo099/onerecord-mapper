import type { Codec } from '../shared/codec.js'
import { deserializeRegulatedEntity } from './deserialize.js'
import type { JsonLdRegulatedEntity, RegulatedEntity } from './schema.js'
import { RegulatedEntitySchema } from './schema.js'
import { serializeRegulatedEntity, serializeRegulatedEntityStrict } from './serialize.js'

export const RegulatedEntityCodec: Codec<
  RegulatedEntity,
  JsonLdRegulatedEntity,
  'RegulatedEntity'
> = Object.freeze({
  schema: RegulatedEntitySchema,
  serialize: serializeRegulatedEntity,
  serializeStrict: serializeRegulatedEntityStrict,
  deserialize: deserializeRegulatedEntity,
  type: 'RegulatedEntity',
} as const)
