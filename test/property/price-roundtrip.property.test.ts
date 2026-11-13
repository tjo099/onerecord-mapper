import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import { PriceSchema, deserializePrice, serializePrice } from '../../src/classes/price/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

const num = fc.double({ noNaN: true, noDefaultInfinity: true })

const arbitrary = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('Price' as const),
  '@id': iriArb('price'),
  chargeCode: fc.option(fc.string({ minLength: 1, maxLength: 16 }), { nil: undefined }),
  forBookingOption: fc.option(iriArb('bookingoption'), { nil: undefined }),
  grandTotal: fc.option(num, { nil: undefined }),
  ratings: fc.option(fc.array(iriArb('ratings'), { minLength: 1, maxLength: 3 }), {
    nil: undefined,
  }),
})

describe('Price round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent', () => {
    roundTripProperty({
      arbitrary,
      codec: { serialize: serializePrice, deserialize: deserializePrice },
      schema: PriceSchema,
    })
  })
})
