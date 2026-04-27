import { describe, expect, it } from 'vitest'
import { isForbiddenKey, scanForPollution } from '../../../src/safety/prototype-pollution.js'

describe('isForbiddenKey (string keys)', () => {
  it('rejects __proto__, constructor, prototype', () => {
    expect(isForbiddenKey('__proto__')).toBe(true)
    expect(isForbiddenKey('constructor')).toBe(true)
    expect(isForbiddenKey('prototype')).toBe(true)
  })

  it('rejects accessor-helper keys', () => {
    for (const k of [
      '__defineGetter__',
      '__defineSetter__',
      '__lookupGetter__',
      '__lookupSetter__',
    ]) {
      expect(isForbiddenKey(k)).toBe(true)
    }
  })

  it('rejects Unicode-confusable __proto__ (full-width input, function normalizes internally — v2 A2-N2)', () => {
    expect(isForbiddenKey('＿＿proto＿＿')).toBe(true)
  })

  it('accepts ordinary class keys', () => {
    expect(isForbiddenKey('@type')).toBe(false)
    expect(isForbiddenKey('grossWeight')).toBe(false)
    expect(isForbiddenKey('hasShipment')).toBe(false)
  })
})

describe('scanForPollution', () => {
  it('flags an object with __proto__ key', () => {
    const obj = JSON.parse('{"__proto__": {"polluted": true}, "ok": 1}')
    const r = scanForPollution(obj, '$')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('prototype_pollution_attempt')
  })

  it('flags Symbol-keyed property', () => {
    const obj: Record<string, unknown> = { ok: 1 }
    Object.defineProperty(obj, Symbol('evil'), { value: 1, enumerable: true })
    const r = scanForPollution(obj, '$')
    expect(r.ok).toBe(false)
  })

  it('flags accessor (getter) on input object', () => {
    const obj: Record<string, unknown> = {}
    Object.defineProperty(obj, 'evil', { get: () => 'pwned', enumerable: true })
    const r = scanForPollution(obj, '$')
    expect(r.ok).toBe(false)
  })

  it('passes a clean nested object', () => {
    const obj = { a: { b: { c: 1 } }, list: [1, 2, 3] }
    const r = scanForPollution(obj, '$')
    expect(r.ok).toBe(true)
  })
})
