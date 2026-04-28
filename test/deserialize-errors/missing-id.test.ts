import { describe, expect, it } from 'vitest'
import { dispatchGraphWalk } from '../../src/dispatch/graph-walk.js'

describe('dispatch.graphWalk -> missing_id', () => {
  it('emits missing_id for an embedded cross-reference node without @id', () => {
    const input = {
      '@id': 'https://example/wb',
      '@type': 'Waybill',
      // shipmentInformation is in FIELD_TYPES (expects Shipment) so it
      // counts as a cross-reference position; missing @id triggers
      // missing_id.
      shipmentInformation: { '@type': 'Shipment' },
    }
    const r = dispatchGraphWalk(input, 'Waybill')
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe('missing_id')
      if (r.error.kind === 'missing_id') {
        expect(r.error.objectType).toBe('Shipment')
      }
    }
  })

  it('does not emit for cross-reference nodes that do have @id', () => {
    const input = {
      '@id': 'https://example/wb',
      '@type': 'Waybill',
      shipmentInformation: { '@id': 'https://example/sh', '@type': 'Shipment' },
    }
    const r = dispatchGraphWalk(input, 'Waybill')
    expect(r.ok).toBe(true)
  })
})
