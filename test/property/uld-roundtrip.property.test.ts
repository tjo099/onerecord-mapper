import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import { ULDSchema, deserializeULD, serializeULD } from '../../src/classes/uld/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

const arbitrary = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('ULD' as const),
  '@id': iriArb('uld'),
  uldTypeCode: fc.option(fc.string({ minLength: 1, maxLength: 16 }), { nil: undefined }),
  uldSerialNumber: fc.option(fc.string({ minLength: 1, maxLength: 32 }), { nil: undefined }),
  ownerCode: fc.option(fc.string({ minLength: 1, maxLength: 16 }), { nil: undefined }),
  // domain-inherited via :LoadingUnit — NOT a :ULD class restriction
  tareWeight: fc.option(
    fc.record({
      numericalValue: fc.float({ min: 0, noNaN: true, noDefaultInfinity: true }),
      unit: fc.constant('KGM'),
    }),
    { nil: undefined },
  ),
  loadingIndicator: fc.option(fc.string({ minLength: 1, maxLength: 16 }), { nil: undefined }),
  ataDesignator: fc.option(fc.string({ minLength: 1, maxLength: 16 }), { nil: undefined }),
  demurrageCode: fc.option(fc.string({ minLength: 1, maxLength: 16 }), { nil: undefined }),
  odlnCode: fc.option(fc.string({ minLength: 1, maxLength: 16 }), { nil: undefined }),
  serviceabilityCode: fc.option(fc.string({ minLength: 1, maxLength: 16 }), { nil: undefined }),
  damageFlag: fc.option(fc.boolean(), { nil: undefined }),
  numberOfDoors: fc.option(fc.nat({ max: 99 }), { nil: undefined }),
  numberOfFittings: fc.option(fc.nat({ max: 99 }), { nil: undefined }),
  numberOfNets: fc.option(fc.nat({ max: 99 }), { nil: undefined }),
  numberOfStraps: fc.option(fc.nat({ max: 99 }), { nil: undefined }),
  sealNumber: fc.option(fc.string({ minLength: 1, maxLength: 32 }), { nil: undefined }),
  // domain-inherited via :LoadingUnit — NOT a :ULD class restriction
  inUnitComposition: fc.option(iriArb('unitcomposition'), { nil: undefined }),
  // domain-inherited via :LoadingUnit — NOT a :ULD class restriction
  remarks: fc.option(fc.string({ minLength: 1, maxLength: 512 }), { nil: undefined }),
})

describe('ULD round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent', () => {
    roundTripProperty({
      arbitrary,
      codec: {
        serialize: serializeULD,
        deserialize: deserializeULD,
      },
      schema: ULDSchema,
    })
  })
})
