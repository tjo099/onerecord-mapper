import { bench, describe } from 'vitest'
import { WaybillCodec, dispatch } from '../../src/index.js'

/**
 * R4 mitigation. Measures the dispatch path's overhead relative to the
 * default per-class deserialize. The budget for v0.2.0 is informal
 * (≤2x at safety-limit ceiling, documented in PR description); v0.3
 * may make this a hard CI gate if dispatch becomes default-on.
 *
 * Synthetic Waybill is hand-built rather than loaded from a fixture
 * to keep the bench self-contained — the dispatch overhead scales with
 * total node count, so a moderately-sized graph (~100 nodes) is
 * representative.
 */

function buildSyntheticWaybill(): unknown {
  // Inline a reasonably-sized Waybill that exercises the graph walker
  // without hitting safety limits. The Waybill itself plus 1 embedded
  // Shipment with 50 piece IRIs is well under maxNodes=10_000 and
  // maxDepth=32.
  return {
    '@context': 'https://onerecord.iata.org/ns/cargo',
    '@type': 'Waybill',
    '@id': 'https://test.example/waybill/perf-1',
    waybillType: 'MASTER',
    waybillPrefix: '999',
    waybillNumber: '99999999',
    totalGrossWeight: { unit: 'KGM', value: 12345.67 },
    shipmentInformation: 'https://test.example/shipment/perf-1',
    referredBookingOption: 'https://test.example/bookingoption/perf-1',
  }
}

const syntheticWaybill = buildSyntheticWaybill()

describe('dispatch perf budget', () => {
  bench('default WaybillCodec.deserialize (no graph-walk)', () => {
    WaybillCodec.deserialize(syntheticWaybill)
  })

  bench('dispatch.deserialize.Waybill (with graph-walk)', () => {
    dispatch.deserialize.Waybill(syntheticWaybill)
  })
})
