import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import {
  CO2EmissionsSchema,
  deserializeCO2Emissions,
  serializeCO2Emissions,
} from '../../src/classes/co2-emissions/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

const arbitrary = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('CO2Emissions' as const),
  '@id': iriArb('co2emissions'),
  calculatedEmissions: fc.option(
    fc.record({
      numericalValue: fc.float({ noNaN: true, noDefaultInfinity: true }),
      unit: fc.constant('KGM'),
    }),
    { nil: undefined },
  ),
  calculationFor: fc.option(iriArb('shipment'), { nil: undefined }),
  methodName: fc.option(fc.string({ minLength: 1, maxLength: 128 }), { nil: undefined }),
  methodVersion: fc.option(fc.string({ minLength: 1, maxLength: 64 }), { nil: undefined }),
})

describe('CO2Emissions round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent', () => {
    roundTripProperty({
      arbitrary,
      codec: {
        serialize: serializeCO2Emissions,
        deserialize: deserializeCO2Emissions,
      },
      schema: CO2EmissionsSchema,
    })
  })
})
