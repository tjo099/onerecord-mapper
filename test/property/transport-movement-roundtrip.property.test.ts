import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import {
  TransportMovementSchema,
  deserializeTransportMovement,
  serializeTransportMovement,
} from '../../src/classes/transport-movement/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

const arbitrary = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('TransportMovement' as const),
  '@id': iriArb('transportmovement'),
  transportIdentifier: fc.string({ minLength: 1, maxLength: 17 }),
  modeCode: fc.constantFrom('AIR', 'TRUCK', 'RAIL', 'SEA' as const),
  departureLocation: iriArb('location'),
  arrivalLocation: iriArb('location'),
  movementTimes: fc.option(fc.array(iriArb('movementtime'), { minLength: 1, maxLength: 5 }), {
    nil: undefined,
  }),
  co2Emissions: fc.option(iriArb('co2emissions'), { nil: undefined }),
  fuelType: fc.option(fc.string({ minLength: 1, maxLength: 64 }), { nil: undefined }),
  fuelAmountCalculated: fc.option(
    fc.record({
      numericalValue: fc.float({ noNaN: true, noDefaultInfinity: true }),
      unit: fc.constant('KGM'),
    }),
    { nil: undefined },
  ),
  fuelAmountMeasured: fc.option(
    fc.record({
      numericalValue: fc.float({ noNaN: true, noDefaultInfinity: true }),
      unit: fc.constant('KGM'),
    }),
    { nil: undefined },
  ),
  distanceCalculated: fc.option(
    fc.record({
      numericalValue: fc.float({ noNaN: true, noDefaultInfinity: true }),
      unit: fc.constant('KMT'),
    }),
    { nil: undefined },
  ),
  distanceMeasured: fc.option(
    fc.record({
      numericalValue: fc.float({ noNaN: true, noDefaultInfinity: true }),
      unit: fc.constant('KMT'),
    }),
    { nil: undefined },
  ),
})

describe('TransportMovement round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent', () => {
    roundTripProperty({
      arbitrary,
      codec: {
        serialize: serializeTransportMovement,
        deserialize: deserializeTransportMovement,
      },
      schema: TransportMovementSchema,
    })
  })
})
