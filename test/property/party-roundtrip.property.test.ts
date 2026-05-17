import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import { PartySchema, deserializeParty, serializeParty } from '../../src/classes/party/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

const partyArb = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('Party' as const),
  '@id': iriArb('party'),
  partyRole: fc.constantFrom(
    'SHP' as const,
    'CNE' as const,
    'FFW' as const,
    'CAR' as const,
    'NFY' as const,
    'NI' as const,
    'AGT' as const,
    'GHA' as const,
  ),
  // partyDetails is required (no fc.option). Exercises both union arms:
  //   - bare IRI string (safeIri() arm)
  //   - {@id: IRI} object arm (3.2-rc2 :partyDetails TTL:1881 → :LogisticsAgent)
  // The IRI may resolve to a Person OR Organization (polymorphic, per
  // FIELD_TYPES['Party.partyDetails'] = '*' — see deviation #6).
  partyDetails: fc.oneof(iriArb('company'), fc.record({ '@id': iriArb('company') })),
  accountNumbers: fc.option(fc.array(iriArb('accountnumber'), { maxLength: 10 }), {
    nil: undefined,
  }),
  otherIdentifiers: fc.option(
    fc.array(
      fc.record({
        otherIdentifierType: fc.constant('BARCODE'),
        textualValue: fc.string({ minLength: 1 }),
      }),
      { minLength: 1, maxLength: 3 },
    ),
    { nil: undefined },
  ),
})

describe('Party round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent for any valid Party', () => {
    roundTripProperty({
      arbitrary: partyArb,
      codec: { serialize: serializeParty, deserialize: deserializeParty },
      schema: PartySchema,
    })
  })
})
