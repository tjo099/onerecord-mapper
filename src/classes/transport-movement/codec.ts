import type { Codec } from '../shared/codec.js'
import { deserializeTransportMovement } from './deserialize.js'
import type { JsonLdTransportMovement, TransportMovement } from './schema.js'
import { TransportMovementSchema } from './schema.js'
import { serializeTransportMovement, serializeTransportMovementStrict } from './serialize.js'

export const TransportMovementCodec: Codec<
  TransportMovement,
  JsonLdTransportMovement,
  'TransportMovement'
> = Object.freeze({
  schema: TransportMovementSchema,
  serialize: serializeTransportMovement,
  serializeStrict: serializeTransportMovementStrict,
  deserialize: deserializeTransportMovement,
  type: 'TransportMovement',
} as const)
