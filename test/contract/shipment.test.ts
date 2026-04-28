import { describe, expect, it } from 'vitest'
import { ShipmentCodec } from '../../src/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { getLogisticsObject, neoneReachable, postLogisticsObject } from './_neone-client.js'

const stackUp = await neoneReachable()

describe('contract: Shipment round-trip via NE:ONE Server (T5.3)', () => {
  it.skipIf(!stackUp)('POST then GET preserves Shipment with embedded references', async () => {
    const shipment = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'Shipment',
      '@id': `https://test.flaks.example/test/shipment/contract-${Date.now()}`,
      pieceCount: 12,
      goodsDescription: 'Test cargo — contract test',
      totalGrossWeight: { unit: 'KGM' as const, value: 543.21 },
      containedPieces: [
        'https://test.flaks.example/test/piece/contract-piece-1',
        'https://test.flaks.example/test/piece/contract-piece-2',
      ],
      consignee: 'https://test.flaks.example/test/party/contract-consignee',
      shipper: 'https://test.flaks.example/test/party/contract-shipper',
    }

    const wire = ShipmentCodec.serialize(shipment as never) as Record<string, unknown>
    const { iri, status } = await postLogisticsObject(wire)
    expect(status).toBe(201)

    const got = await getLogisticsObject(iri)
    expect(got['@type']).toBe('Shipment')
    expect(got.pieceCount).toBe(12)
    expect(got.goodsDescription).toBe('Test cargo — contract test')
    expect(got.totalGrossWeight).toBeDefined()
    // Array of IRIs preserved
    expect(Array.isArray(got.containedPieces)).toBe(true)
    expect(got.containedPieces).toEqual(
      expect.arrayContaining([
        'https://test.flaks.example/test/piece/contract-piece-1',
        'https://test.flaks.example/test/piece/contract-piece-2',
      ]),
    )
  })
})
