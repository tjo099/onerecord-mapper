import { PartySchema, serializeParty } from '../../../src/classes/party/index.js'
import { createParty } from '../../factories/party.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'Party',
  schema: PartySchema,
  serialize: serializeParty,
  factory: createParty,
})
