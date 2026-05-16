import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import {
  InsuranceSchema,
  deserializeInsurance,
  serializeInsurance,
} from '../../src/classes/insurance/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

const arbitrary = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('Insurance' as const),
  '@id': iriArb('insurance'),
  insuredAmount: fc.option(
    fc.record({
      numericalValue: fc.float({ noNaN: true, noDefaultInfinity: true }),
      currencyUnit: fc.constant('NOK'),
    }),
    { nil: undefined },
  ),
  coveringOrganization: fc.option(iriArb('company'), { nil: undefined }),
  insuredShipments: fc.option(fc.array(iriArb('shipment'), { minLength: 1, maxLength: 3 }), {
    nil: undefined,
  }),
})

describe('Insurance round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent', () => {
    roundTripProperty({
      arbitrary,
      codec: { serialize: serializeInsurance, deserialize: deserializeInsurance },
      schema: InsuranceSchema,
    })
  })
})
