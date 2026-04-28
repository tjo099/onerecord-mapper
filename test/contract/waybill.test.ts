import { describe, expect, it } from 'vitest'
import { WaybillCodec } from '../../src/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { getLogisticsObject, neoneReachable, postLogisticsObject } from './_neone-client.js'

// Top-level await: evaluated synchronously during test-file registration so
// it.skipIf(!stackUp) sees the real value. beforeAll() resolves AFTER
// it.skipIf has already been evaluated.
const stackUp = await neoneReachable()
if (!stackUp) {
  console.warn(
    '[contract] NE:ONE stack not reachable at http://localhost:8080 — skipping all Waybill contract tests',
  )
}

describe('contract: Waybill round-trip via NE:ONE Server (T5.2)', () => {
  it.skipIf(!stackUp)('POST then GET preserves the Waybill structure', async () => {
    const wb = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'Waybill',
      '@id': `https://test.flaks.example/test/waybill/contract-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      waybillType: 'MASTER' as const,
      waybillPrefix: '999',
      waybillNumber: '99999999',
    }

    // Serialize through our codec to get the wire format.
    const wire = WaybillCodec.serialize(wb as never) as Record<string, unknown>

    // POST via the envelope adapter; server assigns an IRI.
    const { iri, status } = await postLogisticsObject(wire)
    expect(status).toBe(201)
    expect(iri).toMatch(/^https?:\/\/.+\/logistics-objects\//)

    // GET the resource back (response unwrapped from NE:ONE envelope shape).
    const got = await getLogisticsObject(iri)
    expect(got['@type']).toBe('Waybill')
    expect(got.waybillType).toBe('MASTER')
    expect(got.waybillPrefix).toBe('999')
    expect(got.waybillNumber).toBe('99999999')
  })

  it.skipIf(!stackUp)(
    'preserves a full Waybill including totalGrossWeight + IRI references',
    async () => {
      const wb = {
        '@context': CARGO_CONTEXT_IRI,
        '@type': 'Waybill',
        '@id': `https://test.flaks.example/test/waybill/contract-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        waybillType: 'HOUSE' as const,
        waybillPrefix: '042',
        waybillNumber: '11223344',
        totalGrossWeight: { unit: 'KGM' as const, value: 1234.567 },
        shipmentInformation: 'https://test.flaks.example/test/shipment/contract-1',
        referredBookingOption: 'https://test.flaks.example/test/bookingoption/contract-1',
      }
      const wire = WaybillCodec.serialize(wb as never) as Record<string, unknown>
      const { iri } = await postLogisticsObject(wire)
      const got = await getLogisticsObject(iri)
      expect(got.waybillType).toBe('HOUSE')
      expect(got.waybillPrefix).toBe('042')
      expect(got.waybillNumber).toBe('11223344')
      // totalGrossWeight is a nested object — value preserved as JSON-LD literal
      expect(got.totalGrossWeight).toBeDefined()
      // IRI references round-trip as strings
      expect(got.shipmentInformation).toBe('https://test.flaks.example/test/shipment/contract-1')
    },
  )
})
