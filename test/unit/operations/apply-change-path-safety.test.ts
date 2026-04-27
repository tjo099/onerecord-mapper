import { describe, expect, it } from 'vitest'
import { ShipmentCodec, ShipmentSchema } from '../../../src/classes/shipment/index.js'
import { applyChange } from '../../../src/operations/apply-change.js'
import { createShipment } from '../../factories/shipment.js'

// Build a Shipment with a containedPieces array — that's the array we'll
// probe via /containedPieces/<weird-index>.
function shipmentWithPieces() {
  return ShipmentSchema.parse(
    createShipment({
      containedPieces: ['https://example.org/piece/1', 'https://example.org/piece/2'] as never,
    }),
  )
}

describe('applyChange path-safety (array-index probes — spec §6.5.4 step 3)', () => {
  it('rejects /containedPieces/length on array parent', () => {
    const r = applyChange(ShipmentCodec, shipmentWithPieces(), {
      hasOperation: [{ op: 'ADD', path: '/containedPieces/length', value: 'x' }],
    })
    expect(r.ok).toBe(false)
    if (!r.ok && r.error.kind === 'change_partial_failure') {
      expect(r.error.cause.kind).toBe('prototype_pollution_attempt')
    }
  })

  it('rejects /containedPieces/-1 on array parent', () => {
    const r = applyChange(ShipmentCodec, shipmentWithPieces(), {
      hasOperation: [{ op: 'ADD', path: '/containedPieces/-1', value: 'x' }],
    })
    expect(r.ok).toBe(false)
    if (!r.ok && r.error.kind === 'change_partial_failure') {
      expect(r.error.cause.kind).toBe('prototype_pollution_attempt')
    }
  })

  it('rejects /containedPieces/1.5 on array parent', () => {
    const r = applyChange(ShipmentCodec, shipmentWithPieces(), {
      hasOperation: [{ op: 'ADD', path: '/containedPieces/1.5', value: 'x' }],
    })
    expect(r.ok).toBe(false)
    if (!r.ok && r.error.kind === 'change_partial_failure') {
      expect(r.error.cause.kind).toBe('prototype_pollution_attempt')
    }
  })

  it('rejects /containedPieces/NaN on array parent', () => {
    const r = applyChange(ShipmentCodec, shipmentWithPieces(), {
      hasOperation: [{ op: 'ADD', path: '/containedPieces/NaN', value: 'x' }],
    })
    expect(r.ok).toBe(false)
    if (!r.ok && r.error.kind === 'change_partial_failure') {
      expect(r.error.cause.kind).toBe('prototype_pollution_attempt')
    }
  })

  it('rejects /containedPieces/01 (leading zero) on array parent', () => {
    const r = applyChange(ShipmentCodec, shipmentWithPieces(), {
      hasOperation: [{ op: 'ADD', path: '/containedPieces/01', value: 'x' }],
    })
    expect(r.ok).toBe(false)
    if (!r.ok && r.error.kind === 'change_partial_failure') {
      expect(r.error.cause.kind).toBe('prototype_pollution_attempt')
    }
  })

  it('rejects /containedPieces/1e2 (exponent) on array parent', () => {
    const r = applyChange(ShipmentCodec, shipmentWithPieces(), {
      hasOperation: [{ op: 'ADD', path: '/containedPieces/1e2', value: 'x' }],
    })
    expect(r.ok).toBe(false)
    if (!r.ok && r.error.kind === 'change_partial_failure') {
      expect(r.error.cause.kind).toBe('prototype_pollution_attempt')
    }
  })

  it('rejects /__proto__/polluted as prototype_pollution_attempt', () => {
    const r = applyChange(ShipmentCodec, shipmentWithPieces(), {
      hasOperation: [{ op: 'ADD', path: '/__proto__/polluted', value: 1 }],
    })
    expect(r.ok).toBe(false)
    if (!r.ok && r.error.kind === 'change_partial_failure') {
      expect(['prototype_pollution_attempt', 'invalid_pointer']).toContain(r.error.cause.kind)
    }
  })
})
