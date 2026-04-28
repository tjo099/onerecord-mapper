import { describe, expect, it } from 'vitest'
import { PieceCodec } from '../../src/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { getLogisticsObject, neoneReachable, postLogisticsObject } from './_neone-client.js'

const stackUp = await neoneReachable()

describe('contract: Piece round-trip via NE:ONE Server (T5.4)', () => {
  it.skipIf(!stackUp)('POST then GET preserves Piece with grossWeight + dimensions', async () => {
    const piece = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'Piece',
      '@id': `https://test.flaks.example/test/piece/contract-${Date.now()}`,
      grossWeight: { unit: 'KGM' as const, value: 23.5 },
      dimensions: {
        length: 100.0,
        width: 80.0,
        height: 60.0,
        unit: 'CMT' as const,
      },
      goodsDescription: 'Contract test piece',
      slac: 4,
    }

    const wire = PieceCodec.serialize(piece as never) as Record<string, unknown>
    const { iri, status } = await postLogisticsObject(wire)
    expect(status).toBe(201)

    const got = await getLogisticsObject(iri)
    expect(got['@type']).toBe('Piece')
    expect(got.goodsDescription).toBe('Contract test piece')
    expect(got.slac).toBe(4)
    // Nested grossWeight + dimensions arrive via @graph; adapter inlines them.
    expect(got.grossWeight).toBeDefined()
    expect(got.dimensions).toBeDefined()
  })
})
