import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import {
  OtherChargeSchema,
  deserializeOtherCharge,
  serializeOtherCharge,
} from '../../src/classes/other-charge/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

const arbitrary = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('OtherCharge' as const),
  '@id': iriArb('othercharge'),
  otherChargeCode: fc.option(fc.string({ minLength: 1, maxLength: 16 }), { nil: undefined }),
  otherChargeAmount: fc.option(
    fc.record({
      numericalValue: fc.float({ noNaN: true, noDefaultInfinity: true }),
      currencyUnit: fc.constant('NOK'),
    }),
    { nil: undefined },
  ),
  chargePaymentType: fc.option(fc.constantFrom('P', 'C'), { nil: undefined }),
  entitlement: fc.option(fc.constantFrom('C', 'A'), { nil: undefined }),
  chargeQuantity: fc.option(fc.float({ noNaN: true, noDefaultInfinity: true }), {
    nil: undefined,
  }),
  locationIndicator: fc.option(fc.string({ minLength: 1, maxLength: 64 }), { nil: undefined }),
  reasonDescription: fc.option(fc.string({ minLength: 1, maxLength: 256 }), { nil: undefined }),
})

describe('OtherCharge round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent', () => {
    roundTripProperty({
      arbitrary,
      codec: { serialize: serializeOtherCharge, deserialize: deserializeOtherCharge },
      schema: OtherChargeSchema,
    })
  })
})
