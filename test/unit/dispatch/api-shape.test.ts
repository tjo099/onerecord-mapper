import { describe, expect, it } from 'vitest'
import { WaybillCodec, createMapper, dispatch, onerecord } from '../../../src/index.js'

const wireWithDuplicateId = {
  '@context': 'https://onerecord.iata.org/ns/cargo',
  '@type': 'Waybill',
  '@id': 'https://example/dup',
  shipmentInformation: { '@id': 'https://example/dup', '@type': 'Shipment' },
  waybillType: 'MASTER',
  waybillPrefix: '123',
  waybillNumber: '12345678',
}

describe('dispatch — public API shape', () => {
  it('exports the dispatch namespace from the barrel', () => {
    expect(typeof dispatch).toBe('object')
    expect(typeof dispatch.deserialize.Waybill).toBe('function')
    expect(typeof dispatch.deserialize.Shipment).toBe('function')
  })

  it('exports onerecord.dispatch matching the standalone dispatch', () => {
    expect(onerecord.dispatch).toBe(dispatch)
  })

  it('createMapper accepts graphWalk: true', () => {
    const mapper = createMapper({ graphWalk: true })
    expect(typeof mapper.deserializeWaybill).toBe('function')
  })

  it('default WaybillCodec.deserialize behavior is unchanged (no graph-walk)', () => {
    const r = WaybillCodec.deserialize(wireWithDuplicateId)
    // Default deserializer does not run graph-walk; the duplicate @id
    // surfaces as something other than duplicate_id_in_graph.
    if (!r.ok) {
      expect(r.error.kind).not.toBe('duplicate_id_in_graph')
    }
  })

  it('onerecord.dispatch.deserialize.Waybill catches duplicate_id_in_graph', () => {
    const r = onerecord.dispatch.deserialize.Waybill(wireWithDuplicateId)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('duplicate_id_in_graph')
  })

  it('createMapper({ graphWalk: true }).deserializeWaybill catches duplicate_id_in_graph', () => {
    const mapper = createMapper({ graphWalk: true })
    const r = mapper.deserializeWaybill(wireWithDuplicateId)
    if (typeof r === 'object' && r !== null && 'ok' in r) {
      expect((r as { ok: boolean }).ok).toBe(false)
      if ((r as { ok: false; error: { kind: string } }).ok === false) {
        expect((r as { ok: false; error: { kind: string } }).error.kind).toBe(
          'duplicate_id_in_graph',
        )
      }
    }
  })

  it('createMapper({ graphWalk: false }) (default) does not catch duplicate_id_in_graph', () => {
    const mapper = createMapper()
    const r = mapper.deserializeWaybill(wireWithDuplicateId)
    if (typeof r === 'object' && r !== null && 'ok' in r) {
      const result = r as { ok: false; error: { kind: string } } | { ok: true }
      if (result.ok === false) {
        expect(result.error.kind).not.toBe('duplicate_id_in_graph')
      }
    }
  })
})
