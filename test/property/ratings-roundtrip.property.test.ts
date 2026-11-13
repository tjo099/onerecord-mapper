import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import {
  RatingsSchema,
  deserializeRatings,
  serializeRatings,
} from '../../src/classes/ratings/index.js'
import {
  ChargeIdentifier,
  EntitlementCode,
  PrepaidCollectIndicator,
} from '../../src/codes/enums.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

const num = fc.double({ noNaN: true, noDefaultInfinity: true })
const opt = <T>(a: fc.Arbitrary<T>) => fc.option(a, { nil: undefined })

const rangesArb = fc.record({
  '@type': opt(fc.constant('Ranges' as const)),
  rateClassCode: opt(fc.string({ minLength: 1, maxLength: 8 })),
  uldRateClassType: opt(fc.string({ minLength: 1, maxLength: 16 })),
  maximumQuantity: opt(num),
  minimumQuantity: opt(num),
  unitBasis: opt(fc.string({ minLength: 1, maxLength: 64 })),
})

const arbitrary = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('Ratings' as const),
  '@id': iriArb('ratings'),
  billingChargeIdentifier: opt(fc.constantFrom(...ChargeIdentifier.options)),
  chargeDescription: opt(fc.string({ minLength: 1, maxLength: 256 })),
  chargePaymentType: opt(fc.constantFrom(...PrepaidCollectIndicator.options)),
  chargeType: opt(fc.constantFrom(...ChargeIdentifier.options)),
  entitlement: opt(fc.constantFrom(...EntitlementCode.options)),
  forPrices: opt(fc.array(iriArb('price'), { minLength: 1, maxLength: 3 })),
  otherChargeCode: opt(fc.string({ minLength: 1, maxLength: 16 })),
  priceReferenceId: opt(fc.string({ minLength: 1, maxLength: 64 })),
  priceSpecification: opt(fc.string({ minLength: 1, maxLength: 64 })),
  quantity: opt(num),
  ranges: opt(fc.array(rangesArb, { minLength: 1, maxLength: 3 })),
  rcp: opt(fc.string({ minLength: 1, maxLength: 16 })),
  subTotal: opt(num),
})

describe('Ratings round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent', () => {
    roundTripProperty({
      arbitrary,
      codec: { serialize: serializeRatings, deserialize: deserializeRatings },
      schema: RatingsSchema,
    })
  })
})
