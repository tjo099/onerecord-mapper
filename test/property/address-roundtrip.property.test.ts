import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import {
  AddressSchema,
  deserializeAddress,
  serializeAddress,
} from '../../src/classes/address/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

const addressArb = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('Address' as const),
  '@id': iriArb('address'),
  streetAddressLines: fc.array(fc.string({ minLength: 1, maxLength: 70 }), {
    minLength: 1,
    maxLength: 3,
  }),
  cityName: fc.string({ minLength: 1, maxLength: 35 }),
  postalCode: fc.option(fc.string({ minLength: 1, maxLength: 17 }), { nil: undefined }),
  country: fc.record({
    // ISO 3166-1 alpha-2: two uppercase letters
    countryCode: fc
      .integer({ min: 0, max: 25 })
      .chain((a) =>
        fc
          .integer({ min: 0, max: 25 })
          .map((b) => `${String.fromCharCode(65 + a)}${String.fromCharCode(65 + b)}`),
      ),
  }),
  regionName: fc.option(fc.string({ minLength: 1, maxLength: 35 }), { nil: undefined }),
})

describe('Address round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent for any valid Address', () => {
    roundTripProperty({
      arbitrary: addressArb,
      codec: { serialize: serializeAddress, deserialize: deserializeAddress },
      schema: AddressSchema,
    })
  })
})
