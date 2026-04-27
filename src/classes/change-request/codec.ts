import type { Codec } from '../shared/codec.js'
import { deserializeChangeRequest } from './deserialize.js'
import type { ChangeRequest, JsonLdChangeRequest } from './schema.js'
import { ChangeRequestSchema } from './schema.js'
import { serializeChangeRequest, serializeChangeRequestStrict } from './serialize.js'

export const ChangeRequestCodec: Codec<ChangeRequest, JsonLdChangeRequest, 'ChangeRequest'> =
  Object.freeze({
    schema: ChangeRequestSchema,
    serialize: serializeChangeRequest,
    serializeStrict: serializeChangeRequestStrict,
    deserialize: deserializeChangeRequest,
    type: 'ChangeRequest',
  } as const)
