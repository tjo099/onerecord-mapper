import { describe, expect, it } from 'vitest'
import { dispatchGraphWalk } from '../../src/dispatch/graph-walk.js'

describe('dispatch.graphWalk -> duplicate_id_in_graph', () => {
  it('emits duplicate_id_in_graph when two distinct nodes share an @id', () => {
    const input = {
      '@id': 'https://example/dup',
      '@type': 'Waybill',
      shipmentInformation: { '@id': 'https://example/dup', '@type': 'Shipment' },
    }
    const r = dispatchGraphWalk(input, 'Waybill')
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe('duplicate_id_in_graph')
      if (r.error.kind === 'duplicate_id_in_graph') {
        expect(r.error.iri).toBe('https://example/dup')
      }
    }
  })

  it('does not emit when @ids are unique', () => {
    const input = {
      '@id': 'https://example/wb',
      '@type': 'Waybill',
      shipmentInformation: { '@id': 'https://example/sh', '@type': 'Shipment' },
    }
    const r = dispatchGraphWalk(input, 'Waybill')
    expect(r.ok).toBe(true)
  })
})
