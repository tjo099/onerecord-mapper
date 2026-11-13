import type { Codec } from '../shared/codec.js'
import { deserializeTransportLegs } from './deserialize.js'
import type { JsonLdTransportLegs, TransportLegs } from './schema.js'
import { TransportLegsSchema } from './schema.js'
import { serializeTransportLegs, serializeTransportLegsStrict } from './serialize.js'

export const TransportLegsCodec: Codec<TransportLegs, JsonLdTransportLegs, 'TransportLegs'> =
  Object.freeze({
    schema: TransportLegsSchema,
    serialize: serializeTransportLegs,
    serializeStrict: serializeTransportLegsStrict,
    deserialize: deserializeTransportLegs,
    type: 'TransportLegs',
  } as const)
