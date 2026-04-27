import type { Codec } from '../shared/codec.js'
import { deserializeChange } from './deserialize.js'
import type { Change, JsonLdChange } from './schema.js'
import { ChangeSchema } from './schema.js'
import { serializeChange, serializeChangeStrict } from './serialize.js'

export const ChangeCodec: Codec<Change, JsonLdChange, 'Change'> = Object.freeze({
  schema: ChangeSchema,
  serialize: serializeChange,
  serializeStrict: serializeChangeStrict,
  deserialize: deserializeChange,
  type: 'Change',
} as const)
