import { describe, expect, it } from 'vitest'
import { dispatchGraphWalk } from '../../src/dispatch/graph-walk.js'

describe('dispatch.graphWalk -> missing_type', () => {
  it('emits missing_type when a non-leaf node lacks @type', () => {
    const input = {
      '@id': 'https://example/root',
      '@type': 'Waybill',
      // The nested object has children (consignee key) but no @type ->
      // missing_type.
      shipmentInformation: {
        '@id': 'https://example/sh',
        consignee: { '@id': 'https://example/p', '@type': 'Party' },
      },
    }
    const r = dispatchGraphWalk(input, 'Waybill')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('missing_type')
  })

  it('does not emit when every non-leaf node has @type', () => {
    const input = {
      '@id': 'https://example/root',
      '@type': 'Waybill',
      shipmentInformation: { '@id': 'https://example/sh', '@type': 'Shipment' },
    }
    const r = dispatchGraphWalk(input, 'Waybill')
    expect(r.ok).toBe(true)
  })
})
