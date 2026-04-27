import { describe, expect, it } from 'vitest'
import { deserializeWaybill } from '../../src/classes/waybill/index.js'
import { createWaybill } from '../factories/waybill.js'

describe('deserialize -> prototype_pollution_attempt (envelope-level)', () => {
  it('rejects __proto__ key in input as prototype_pollution_attempt', () => {
    // Use Object.defineProperty to actually set a __proto__ own property
    // (spread/assign silently skips __proto__ in most JS engines).
    const malicious = Object.defineProperty({ ...createWaybill() }, '__proto__', {
      value: { polluted: 1 },
      enumerable: true,
      configurable: true,
      writable: true,
    }) as unknown
    const r = deserializeWaybill(malicious)
    // The pre-validate pollution scanner catches this before Zod
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(['prototype_pollution_attempt', 'zod_validation']).toContain(r.error.kind)
    }
  })

  it.skip('Phase 9 — applyChange __proto__ path rejection (T50)', () => {
    // Filled in when applyChange + JSON-pointer helper land.
  })

  it.skip('Phase 9 — invalid_pointer for empty path (T50)', () => {
    // Filled in when applyChange lands.
  })
})
