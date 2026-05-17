import { describe, expect, it } from 'vitest'
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

describe('Party Path A', () => {
  const base = {
    '@context': 'https://onerecord.iata.org/ns/cargo',
    '@type': 'Party',
    '@id': 'https://t.example/t/party/1',
  }
  it('partyDetails accepts {@id}-object and bare IRI; adds NI role', () => {
    expect(
      PartySchema.safeParse({
        ...base,
        partyRole: 'SHP',
        partyDetails: { '@id': 'https://t.example/t/company/1' },
      }).success,
    ).toBe(true)
    expect(
      PartySchema.safeParse({
        ...base,
        partyRole: 'NI',
        partyDetails: 'https://t.example/t/company/1',
      }).success,
    ).toBe(true)
  })
})
