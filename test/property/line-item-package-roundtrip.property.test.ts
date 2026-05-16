import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import {
  LineItemPackageSchema,
  deserializeLineItemPackage,
  serializeLineItemPackage,
} from '../../src/classes/line-item-package/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

const arbitrary = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('LineItemPackage' as const),
  '@id': iriArb('lineitempackage'),
  pieceReferences: fc.option(fc.array(iriArb('piece'), { minLength: 1, maxLength: 3 }), {
    nil: undefined,
  }),
  packageGrossWeight: fc.option(
    fc.record({
      numericalValue: fc.float({ noNaN: true, noDefaultInfinity: true }),
      unit: fc.constant('KGM'),
    }),
    { nil: undefined },
  ),
  packageVolume: fc.option(
    fc.record({
      numericalValue: fc.float({ noNaN: true, noDefaultInfinity: true }),
      unit: fc.constant('KGM'),
    }),
    { nil: undefined },
  ),
  packageSlac: fc.option(fc.nat(), { nil: undefined }),
})

describe('LineItemPackage round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent', () => {
    roundTripProperty({
      arbitrary,
      codec: { serialize: serializeLineItemPackage, deserialize: deserializeLineItemPackage },
      schema: LineItemPackageSchema,
    })
  })
})
