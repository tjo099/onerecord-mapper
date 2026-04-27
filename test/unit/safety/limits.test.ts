import { describe, expect, it } from 'vitest'
import { DEFAULT_SAFETY_LIMITS, mergeLimits } from '../../../src/safety/limits.js'

describe('DEFAULT_SAFETY_LIMITS', () => {
  it('exposes spec §6.5.1 defaults', () => {
    expect(DEFAULT_SAFETY_LIMITS.maxDepth).toBe(32)
    expect(DEFAULT_SAFETY_LIMITS.maxNodes).toBe(10_000)
    expect(DEFAULT_SAFETY_LIMITS.maxStringLength).toBe(65_536)
    expect(DEFAULT_SAFETY_LIMITS.maxArrayLength).toBe(5_000)
    expect(DEFAULT_SAFETY_LIMITS.maxPayloadBytes).toBe(5_000_000)
  })

  it('is frozen (mutation throws in strict mode)', () => {
    expect(Object.isFrozen(DEFAULT_SAFETY_LIMITS)).toBe(true)
  })
})

describe('mergeLimits (v2)', () => {
  it('overrides only the provided fields', () => {
    const merged = mergeLimits({ maxDepth: 16 })
    expect(merged.maxDepth).toBe(16)
    expect(merged.maxNodes).toBe(DEFAULT_SAFETY_LIMITS.maxNodes)
  })

  it('returns a frozen object (A1-M6)', () => {
    expect(Object.isFrozen(mergeLimits(undefined))).toBe(true)
    expect(Object.isFrozen(mergeLimits({ maxDepth: 1 }))).toBe(true)
  })

  it('rejects negative limits with explicit error (A1-m4)', () => {
    expect(() => mergeLimits({ maxDepth: -1 })).toThrow(/maxDepth.*non-negative/i)
    expect(() => mergeLimits({ maxNodes: -5 })).toThrow(/maxNodes.*non-negative/i)
  })

  it('accepts maxDepth: 0 (legitimate "no nesting") (A1-m4)', () => {
    const m = mergeLimits({ maxDepth: 0 })
    expect(m.maxDepth).toBe(0)
  })

  it('rejects values above Number.MAX_SAFE_INTEGER (v3 — A1-R2-m6)', () => {
    expect(() => mergeLimits({ maxNodes: Number.MAX_SAFE_INTEGER + 1 } as never)).toThrow()
    expect(() => mergeLimits({ maxStringLength: 1e21 } as never)).toThrow()
  })

  it('rejects non-integer (decimal) limits', () => {
    expect(() => mergeLimits({ maxDepth: 1.5 })).toThrow()
  })
})
