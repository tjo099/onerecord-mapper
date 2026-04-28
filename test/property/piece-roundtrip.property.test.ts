import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import { PieceSchema, deserializePiece, serializePiece } from '../../src/classes/piece/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty, weightArb } from './_helpers.js'

// fc.float requires 32-bit-representable bounds; Math.fround coerces.
const POSITIVE_MIN = Math.fround(0.01)
const dimensionsArb = fc.record({
  length: fc.float({ min: POSITIVE_MIN, max: 1000, noNaN: true, noDefaultInfinity: true }),
  width: fc.float({ min: POSITIVE_MIN, max: 1000, noNaN: true, noDefaultInfinity: true }),
  height: fc.float({ min: POSITIVE_MIN, max: 1000, noNaN: true, noDefaultInfinity: true }),
  unit: fc.constant('CMT' as const),
})

const pieceArb = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('Piece' as const),
  '@id': iriArb('piece'),
  grossWeight: weightArb,
  dimensions: fc.option(dimensionsArb, { nil: undefined }),
  goodsDescription: fc.option(fc.string({ minLength: 0, maxLength: 1024 }), { nil: undefined }),
  slac: fc.option(fc.integer({ min: 0, max: 10_000 }), { nil: undefined }),
})

describe('Piece round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent for any valid Piece', () => {
    roundTripProperty({
      arbitrary: pieceArb,
      codec: { serialize: serializePiece, deserialize: deserializePiece },
      schema: PieceSchema,
      numericFields: {
        'grossWeight.value': 'weight',
        // Dimensions use volume precision (4dp) so length/width/height
        // round-trip cleanly even with float drift.
        'dimensions.length': 'volume',
        'dimensions.width': 'volume',
        'dimensions.height': 'volume',
      },
    })
  })
})
