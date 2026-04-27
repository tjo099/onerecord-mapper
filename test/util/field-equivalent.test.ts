import { describe, expect, it } from 'vitest'
import { fieldEquivalent } from './field-equivalent.js'

describe('fieldEquivalent — spec §7.1 tolerances', () => {
  it('treats undefined / null / missing as equivalent for optional fields', () => {
    expect(fieldEquivalent({ a: 1 }, { a: 1, b: undefined })).toBe(true)
    expect(fieldEquivalent({ a: 1 }, { a: 1, b: null })).toBe(true)
    expect(fieldEquivalent({ a: 1, b: undefined }, { a: 1, b: null })).toBe(true)
  })

  it('treats empty array as equivalent to missing key (recursive)', () => {
    expect(fieldEquivalent({ a: 1 }, { a: 1, list: [] })).toBe(true)
    expect(fieldEquivalent({ nested: { a: 1 } }, { nested: { a: 1, list: [] } })).toBe(true)
  })

  it('property order is irrelevant', () => {
    expect(fieldEquivalent({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true)
  })

  it('HTTP/HTTPS IRIs compared via URL.href normalization (trailing slash, case)', () => {
    expect(
      fieldEquivalent({ iri: 'https://Example.COM/x/' }, { iri: 'https://example.com/x/' }),
    ).toBe(true)
  })

  it('non-HTTP IRIs compared as exact NFC strings', () => {
    expect(fieldEquivalent({ iri: 'urn:uuid:abc' }, { iri: 'urn:uuid:abc' })).toBe(true)
    expect(fieldEquivalent({ iri: 'urn:uuid:abc' }, { iri: 'urn:uuid:ABC' })).toBe(false)
  })

  it('numeric precision: weights at 3dp, monetary at 2dp', () => {
    expect(
      fieldEquivalent(
        { totalGrossWeight: { unit: 'KGM', value: 100.0001 } },
        { totalGrossWeight: { unit: 'KGM', value: 100 } },
        { numericFields: { totalGrossWeight: 'weight' } },
      ),
    ).toBe(true)
    expect(
      fieldEquivalent(
        { price: { amount: 99.999 } },
        { price: { amount: 100 } },
        { numericFields: { price: 'monetary' } },
      ),
    ).toBe(true)
  })

  it('datetime: UTC-normalized for comparison (offset-equivalent)', () => {
    expect(
      fieldEquivalent(
        { eventTimestamp: '2026-01-01T00:00:00Z' },
        { eventTimestamp: '2026-01-01T01:00:00+01:00' },
      ),
    ).toBe(true)
  })

  it('reports false for genuinely different values', () => {
    expect(fieldEquivalent({ a: 1 }, { a: 2 })).toBe(false)
    expect(fieldEquivalent({ a: 1 }, { b: 1 })).toBe(false)
  })
})
