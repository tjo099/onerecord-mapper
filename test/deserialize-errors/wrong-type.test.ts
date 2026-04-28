import { describe, expect, it } from 'vitest'
import { dispatchGraphWalk } from '../../src/dispatch/graph-walk.js'

describe('dispatch.graphWalk -> wrong_type_for_endpoint', () => {
  it('emits wrong_type_for_endpoint when @type does not match the field contract', () => {
    const input = {
      '@id': 'https://example/wb',
      '@type': 'Waybill',
      // FIELD_TYPES says Waybill.shipmentInformation expects Shipment.
      // Putting a Party here violates the field contract.
      shipmentInformation: { '@id': 'https://example/p', '@type': 'Party' },
    }
    const r = dispatchGraphWalk(input, 'Waybill')
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe('wrong_type_for_endpoint')
      if (r.error.kind === 'wrong_type_for_endpoint') {
        expect(r.error.expected).toBe('Shipment')
        expect(r.error.got).toBe('Party')
      }
    }
  })

  it('does not emit when @type matches the field contract', () => {
    const input = {
      '@id': 'https://example/wb',
      '@type': 'Waybill',
      shipmentInformation: { '@id': 'https://example/sh', '@type': 'Shipment' },
    }
    const r = dispatchGraphWalk(input, 'Waybill')
    expect(r.ok).toBe(true)
  })

  it('accepts polymorphic field with any @type (Notification.relatedLogisticsObject)', () => {
    const input = {
      '@id': 'https://example/n',
      '@type': 'Notification',
      relatedLogisticsObject: { '@id': 'https://example/wb', '@type': 'Waybill' },
    }
    const r = dispatchGraphWalk(input, 'Notification')
    expect(r.ok).toBe(true)
  })
})
