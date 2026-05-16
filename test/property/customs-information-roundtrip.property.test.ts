import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import {
  CustomsInformationSchema,
  deserializeCustomsInformation,
  serializeCustomsInformation,
} from '../../src/classes/customs-information/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

const arbitrary = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('CustomsInformation' as const),
  '@id': iriArb('customsinformation'),
  ociLineNumber: fc.option(fc.nat(), { nil: undefined }),
  country: fc.option(iriArb('codelistelement'), { nil: undefined }),
  subjectCode: fc.option(fc.string({ minLength: 1, maxLength: 16 }), { nil: undefined }),
  contentCode: fc.option(fc.string({ minLength: 1, maxLength: 16 }), { nil: undefined }),
  otherCustomsInformation: fc.option(fc.string({ minLength: 1, maxLength: 512 }), {
    nil: undefined,
  }),
  note: fc.option(fc.string({ minLength: 1, maxLength: 512 }), { nil: undefined }),
  // owl:maxCardinality 1 — single safeIri, NOT array
  issuedForPiece: fc.option(iriArb('piece'), { nil: undefined }),
  issuedForShipment: fc.option(iriArb('shipment'), { nil: undefined }),
})

describe('CustomsInformation round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent', () => {
    roundTripProperty({
      arbitrary,
      codec: {
        serialize: serializeCustomsInformation,
        deserialize: deserializeCustomsInformation,
      },
      schema: CustomsInformationSchema,
    })
  })
})
