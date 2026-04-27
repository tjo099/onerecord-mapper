import type { Codec } from '../shared/codec.js'
import { deserializeMovementTime } from './deserialize.js'
import type { JsonLdMovementTime, MovementTime } from './schema.js'
import { MovementTimeSchema } from './schema.js'
import { serializeMovementTime, serializeMovementTimeStrict } from './serialize.js'

export const MovementTimeCodec: Codec<MovementTime, JsonLdMovementTime, 'MovementTime'> =
  Object.freeze({
    schema: MovementTimeSchema,
    serialize: serializeMovementTime,
    serializeStrict: serializeMovementTimeStrict,
    deserialize: deserializeMovementTime,
    type: 'MovementTime',
  } as const)
