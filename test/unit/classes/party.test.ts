import {
  PartyCodec,
  PartySchema,
  deserializeParty,
  serializeParty,
  serializePartyStrict,
} from '../../../src/classes/party/index.js'
import { createParty } from '../../factories/party.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'Party',
  schema: PartySchema,
  serialize: serializeParty,
  serializeStrict: serializePartyStrict,
  deserialize: deserializeParty,
  codec: PartyCodec,
  factory: createParty,
  emptyArrayField: 'accountNumbers',
  invalidIriField: 'partyDetails',
})
