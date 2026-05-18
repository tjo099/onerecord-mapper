import type { Codec } from '../shared/codec.js'
import { deserializeComposing } from './deserialize.js'
import type { JsonLdComposing, Composing } from './schema.js'
import { ComposingSchema } from './schema.js'
import { serializeComposing, serializeComposingStrict } from './serialize.js'

export const ComposingCodec: Codec<Composing, JsonLdComposing, 'Composing'> = Object.freeze({
  schema: ComposingSchema,
  serialize: serializeComposing,
  serializeStrict: serializeComposingStrict,
  deserialize: deserializeComposing,
  type: 'Composing',
} as const)
