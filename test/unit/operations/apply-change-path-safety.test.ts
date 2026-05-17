import { describe, expect, it } from 'vitest'
import { ShipmentCodec, ShipmentSchema } from '../../../src/classes/shipment/index.js'
import { applyChange } from '../../../src/operations/apply-change.js'
import { createShipment } from '../../factories/shipment.js'

// Build a Shipment with a pieces array — that's the array we'll
// probe via /pieces/<weird-index>.
function shipmentWithPieces() {
  return ShipmentSchema.parse(
    createShipment({
      pieces: ['https://example.org/piece/1', 'https://example.org/piece/2'] as never,
    }),
  )
}

describe('applyChange path-safety (array-index probes — spec §6.5.4 step 3)', () => {
  it('rejects /pieces/length on array parent', () => {
    const r = applyChange(ShipmentCodec, shipmentWithPieces(), {
      hasOperation: [{ op: 'ADD', path: '/pieces/length', value: 'x' }],
    })
    expect(r.ok).toBe(false)
    if (!r.ok && r.error.kind === 'change_partial_failure') {
      expect(r.error.cause.kind).toBe('prototype_pollution_attempt')
    }
  })

  it('rejects /pieces/-1 on array parent', () => {
    const r = applyChange(ShipmentCodec, shipmentWithPieces(), {
      hasOperation: [{ op: 'ADD', path: '/pieces/-1', value: 'x' }],
    })
    expect(r.ok).toBe(false)
    if (!r.ok && r.error.kind === 'change_partial_failure') {
      expect(r.error.cause.kind).toBe('prototype_pollution_attempt')
    }
  })

  it('rejects /pieces/1.5 on array parent', () => {
    const r = applyChange(ShipmentCodec, shipmentWithPieces(), {
      hasOperation: [{ op: 'ADD', path: '/pieces/1.5', value: 'x' }],
    })
    expect(r.ok).toBe(false)
    if (!r.ok && r.error.kind === 'change_partial_failure') {
      expect(r.error.cause.kind).toBe('prototype_pollution_attempt')
    }
  })

  it('rejects /pieces/NaN on array parent', () => {
    const r = applyChange(ShipmentCodec, shipmentWithPieces(), {
      hasOperation: [{ op: 'ADD', path: '/pieces/NaN', value: 'x' }],
    })
    expect(r.ok).toBe(false)
    if (!r.ok && r.error.kind === 'change_partial_failure') {
      expect(r.error.cause.kind).toBe('prototype_pollution_attempt')
    }
  })

  it('rejects /pieces/01 (leading zero) on array parent', () => {
    const r = applyChange(ShipmentCodec, shipmentWithPieces(), {
      hasOperation: [{ op: 'ADD', path: '/pieces/01', value: 'x' }],
    })
    expect(r.ok).toBe(false)
    if (!r.ok && r.error.kind === 'change_partial_failure') {
      expect(r.error.cause.kind).toBe('prototype_pollution_attempt')
    }
  })

  it('rejects /pieces/1e2 (exponent) on array parent', () => {
    const r = applyChange(ShipmentCodec, shipmentWithPieces(), {
      hasOperation: [{ op: 'ADD', path: '/pieces/1e2', value: 'x' }],
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
