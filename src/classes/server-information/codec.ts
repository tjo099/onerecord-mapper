import type { Codec } from '../shared/codec.js'
import { deserializeServerInformation } from './deserialize.js'
import type { JsonLdServerInformation, ServerInformation } from './schema.js'
import { ServerInformationSchema } from './schema.js'
import { serializeServerInformation, serializeServerInformationStrict } from './serialize.js'

export const ServerInformationCodec: Codec<
  ServerInformation,
  JsonLdServerInformation,
  'ServerInformation'
> = Object.freeze({
  schema: ServerInformationSchema,
  serialize: serializeServerInformation,
  serializeStrict: serializeServerInformationStrict,
  deserialize: deserializeServerInformation,
  type: 'ServerInformation',
} as const)
