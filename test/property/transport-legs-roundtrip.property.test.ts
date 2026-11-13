import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import {
  TransportLegsSchema,
  deserializeTransportLegs,
  serializeTransportLegs,
} from '../../src/classes/transport-legs/index.js'
import { TransportMeansServiceType } from '../../src/codes/enums.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

const opt = <T>(a: fc.Arbitrary<T>) => fc.option(a, { nil: undefined })

// Whole-second UTC timestamps, serialised with a Z suffix.
const dateArb = fc
  .date({ min: new Date('2000-01-01T00:00:00Z'), max: new Date('2099-12-31T23:59:59Z') })
  .filter((d) => !Number.isNaN(d.getTime()))
  .map((d) => `${d.toISOString().slice(0, 19)}Z`)

const arbitrary = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('TransportLegs' as const),
  '@id': iriArb('transportlegs'),
  arrivalDate: opt(dateArb),
  arrivalLocation: opt(iriArb('location')),
  co2Emissions: opt(iriArb('co2emissions')),
  departureDate: opt(dateArb),
  departureLocation: opt(iriArb('location')),
  legNumber: opt(fc.integer({ min: -1000, max: 1000 })),
  operatingTransportMeans: opt(iriArb('transportmeans')),
  transportIdentifier: opt(fc.string({ maxLength: 17 })),
  transportMeansServiceType: opt(fc.constantFrom(...TransportMeansServiceType.options)),
  transportMeansType: opt(fc.string({ minLength: 1, maxLength: 16 })),
})

describe('TransportLegs round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent', () => {
    roundTripProperty({
      arbitrary,
      codec: { serialize: serializeTransportLegs, deserialize: deserializeTransportLegs },
      schema: TransportLegsSchema,
    })
  })
})
