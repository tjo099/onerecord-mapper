import type { Codec } from '../shared/codec.js'
import { deserializeParty } from './deserialize.js'
import type { JsonLdParty, Party } from './schema.js'
import { PartySchema } from './schema.js'
import { serializeParty, serializePartyStrict } from './serialize.js'

export const PartyCodec: Codec<Party, JsonLdParty, 'Party'> = Object.freeze({
  schema: PartySchema,
  serialize: serializeParty,
  serializeStrict: serializePartyStrict,
  deserialize: deserializeParty,
  type: 'Party',
} as const)
