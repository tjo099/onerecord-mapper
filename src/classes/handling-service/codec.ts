import type { Codec } from '../shared/codec.js'
import { deserializeHandlingService } from './deserialize.js'
import type { HandlingService, JsonLdHandlingService } from './schema.js'
import { HandlingServiceSchema } from './schema.js'
import { serializeHandlingService, serializeHandlingServiceStrict } from './serialize.js'

export const HandlingServiceCodec: Codec<
  HandlingService,
  JsonLdHandlingService,
  'HandlingService'
> = Object.freeze({
  schema: HandlingServiceSchema,
  serialize: serializeHandlingService,
  serializeStrict: serializeHandlingServiceStrict,
  deserialize: deserializeHandlingService,
  type: 'HandlingService',
} as const)
