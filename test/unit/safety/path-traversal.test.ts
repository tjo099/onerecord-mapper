// test/unit/safety/path-traversal.test.ts
import { describe, expect, it } from 'vitest'
import {
  isSafePathSegment,
  isValidArrayIndex,
  validatePathSegments,
} from '../../../src/safety/path-traversal.js'

describe('isSafePathSegment', () => {
  it('rejects forbidden segments (string + Unicode NFKC variants)', () => {
    for (const seg of ['__proto__', 'constructor', 'prototype', '__defineGetter__']) {
      expect(isSafePathSegment(seg)).toBe(false)
    }
    expect(isSafePathSegment('＿＿proto＿＿')).toBe(false)
  })

  it('accepts ordinary keys', () => {
    expect(isSafePathSegment('hasShipment')).toBe(true)
    expect(isSafePathSegment('grossWeight')).toBe(true)
  })
})

describe('isValidArrayIndex (NEW v2 — A3-M3)', () => {
  it('accepts non-negative integer indices in canonical form', () => {
    expect(isValidArrayIndex('0')).toBe(true)
    expect(isValidArrayIndex('1')).toBe(true)
    expect(isValidArrayIndex('42')).toBe(true)
    expect(isValidArrayIndex('999')).toBe(true)
  })

  it('rejects "length" (Array prototype property)', () => {
    expect(isValidArrayIndex('length')).toBe(false)
  })

  it('rejects negative, decimal, scientific, NaN, infinity, leading-zero', () => {
    for (const bad of ['-1', '1.5', '1e2', 'NaN', 'Infinity', '-0', '01', '0x1', '+1', '']) {
      expect(isValidArrayIndex(bad)).toBe(false)
    }
  })

  it('rejects whitespace-padded', () => {
    expect(isValidArrayIndex(' 1 ')).toBe(false)
  })
})

describe('validatePathSegments', () => {
  it('passes for clean JSON pointer with valid array index', () => {
    expect(validatePathSegments('/hasShipment/pieces/0/grossWeight').ok).toBe(true)
  })

  it('rejects __proto__ in any segment', () => {
    const r = validatePathSegments('/foo/__proto__/bar')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('prototype_pollution_attempt')
  })

  it('handles RFC 6901 escapes (~0=~, ~1=/)', () => {
    expect(validatePathSegments('/has~1Shipment/foo~0bar').ok).toBe(true)
  })
})
