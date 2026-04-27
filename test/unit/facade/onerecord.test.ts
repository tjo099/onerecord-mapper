// test/unit/facade/onerecord.test.ts
import { describe, expect, it } from 'vitest'
import { onerecord } from '../../../src/facade.js'
import { CLASSES } from '../../../src/factory-classes.js'
import { createWaybill } from '../../factories/waybill.js'

describe('onerecord facade', () => {
  it('onerecord.deserialize.Waybill succeeds on a valid waybill', () => {
    const r = onerecord.deserialize.Waybill(createWaybill()) as { ok: boolean }
    expect(r.ok).toBe(true)
  })

  it('onerecord facade is frozen (no external mutation)', () => {
    expect(Object.isFrozen(onerecord)).toBe(true)
    expect(Object.isFrozen(onerecord.deserialize)).toBe(true)
    expect(Object.isFrozen(onerecord.serialize)).toBe(true)
  })

  it('deserialize has one entry per class in CLASSES map', () => {
    for (const className of Object.keys(CLASSES)) {
      expect(
        typeof (onerecord.deserialize as Record<string, unknown>)[className],
        `deserialize.${className} should be a function`,
      ).toBe('function')
    }
  })

  it('serialize has one entry per class in CLASSES map', () => {
    for (const className of Object.keys(CLASSES)) {
      expect(
        typeof (onerecord.serialize as Record<string, unknown>)[className],
        `serialize.${className} should be a function`,
      ).toBe('function')
    }
  })

  it('onerecord.deserialize.Waybill returns ok=false on invalid input', () => {
    const r = onerecord.deserialize.Waybill({ bad: 'input' }) as {
      ok: boolean
      error: { kind: string }
    }
    expect(r.ok).toBe(false)
  })
})
