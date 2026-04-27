// test/unit/factory/create-mapper.test.ts
import { describe, expect, it } from 'vitest'
import { CLASSES } from '../../../src/factory-classes.js'
import { createMapper } from '../../../src/factory.js'
import { createWaybill } from '../../factories/waybill.js'

describe('createMapper (v3)', () => {
  it('binds limits per-instance with frozen capture (A1-B4)', () => {
    const inputOpts = { limits: { maxDepth: 4 } as { maxDepth: number } }
    const m = createMapper(inputOpts)
    expect(m.limits.maxDepth).toBe(4)
    inputOpts.limits.maxDepth = 99
    expect(m.limits.maxDepth).toBe(4)
    expect(Object.isFrozen(m.limits)).toBe(true)
  })

  it('deep-freezes iriStrategy so consumer mutation does not leak (v3 — A1-R2-M4)', () => {
    const customStrategy = {
      allowedSchemes: ['https'],
      build: (cls: string, parts: { tenant: string; uuid: string; host?: string }) =>
        `https://${parts.host ?? 'h'}/${parts.tenant}/${cls.toLowerCase()}/${parts.uuid}`,
    }
    const m = createMapper({ iriStrategy: customStrategy as never })
    // Consumer-side mutation must throw (in strict mode) or no-op (in sloppy mode).
    // Either way, m.iriStrategy.allowedSchemes must remain unchanged.
    expect(Object.isFrozen(m.iriStrategy)).toBe(true)
    expect(Object.isFrozen(m.iriStrategy.allowedSchemes)).toBe(true)
    // structuredClone is the ultimate witness — frozen objects clone cleanly.
    const cloned = structuredClone({
      limits: m.limits,
      allowedSchemes: m.iriStrategy.allowedSchemes,
    })
    expect(cloned.limits.maxDepth).toBe(m.limits.maxDepth)
  })

  it('depth-bound deserialize fires deterministic depth_limit_exceeded (A2-M4)', () => {
    const m = createMapper({ limits: { maxDepth: 1 } })
    const deep = {
      '@context': 'https://onerecord.iata.org/ns/cargo',
      '@type': 'Waybill',
      '@id': 'https://x/y/z',
      a: { b: { c: 1 } },
    }
    const r = m.deserializeWaybill(deep) as
      | { ok: false; error: { kind: string } }
      | { ok: true; value: unknown }
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('depth_limit_exceeded')
  })

  it('within-bound deserialize succeeds', () => {
    const m = createMapper()
    const r = m.deserializeWaybill(createWaybill())
    expect(r.ok).toBe(true)
  })

  it('exposes one deserialize + one serialize method per CLASSES entry (v3 — A1-R2-M3)', () => {
    const m = createMapper()
    for (const className of Object.keys(CLASSES)) {
      expect(typeof (m as unknown as Record<string, unknown>)[`deserialize${className}`]).toBe(
        'function',
      )
      expect(typeof (m as unknown as Record<string, unknown>)[`serialize${className}`]).toBe(
        'function',
      )
    }
  })

  it('Mapper state is structured-clone-safe; bound methods are NOT (v3 — A3-R2-m2)', () => {
    const m = createMapper()
    // Cloning the state subset succeeds:
    const state = { limits: m.limits, allowedSchemes: m.iriStrategy.allowedSchemes }
    expect(() => structuredClone(state)).not.toThrow()
    // Cloning the Mapper directly throws because of the function-valued methods:
    expect(() => structuredClone(m as unknown as Record<string, unknown>)).toThrow()
  })
})
