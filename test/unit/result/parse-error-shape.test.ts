// test/unit/result/parse-error-shape.test.ts
import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  PARSE_ERROR_KINDS,
  PARSE_ERROR_KIND_TO_FILE,
  type ParseError,
  type ParseResult,
  type PublicParseError,
  SerializationError,
} from '../../../src/result.js'

describe('result module', () => {
  it('ParseResult discriminates ok via the literal `ok` field', () => {
    const okResult: ParseResult<number> = { ok: true, value: 42 }
    const errResult: ParseResult<number> = {
      ok: false,
      error: { kind: 'missing_id', objectType: 'Waybill', path: '$' },
    }
    expect(okResult.ok).toBe(true)
    expect(errResult.ok).toBe(false)
  })

  it('PARSE_ERROR_KINDS lists exactly the variants in the union (26 — v0.2 adds 4 deviation closures)', () => {
    expectTypeOf<(typeof PARSE_ERROR_KINDS)[number]>().toEqualTypeOf<ParseError['kind']>()
    expect(PARSE_ERROR_KINDS).toHaveLength(26)
    expect(PARSE_ERROR_KINDS).toContain('invalid_pointer')
    expect(PARSE_ERROR_KINDS).toContain('blank_node_forbidden')
    expect(PARSE_ERROR_KINDS).toContain('iri_not_canonical')
    expect(PARSE_ERROR_KINDS).toContain('context_order_violation')
    expect(PARSE_ERROR_KINDS).toContain('domain_constraint_violation')
  })

  it('PARSE_ERROR_KIND_TO_FILE has exactly one entry per kind (v3 — A2-R2-B5)', () => {
    for (const kind of PARSE_ERROR_KINDS) {
      expect(PARSE_ERROR_KIND_TO_FILE[kind], `missing file map for kind=${kind}`).toBeTruthy()
      expect(PARSE_ERROR_KIND_TO_FILE[kind]).toMatch(/\.test\.ts$/)
    }
  })

  it('PublicParseError omits path by default but supports optional path', () => {
    const pubA: PublicParseError = { kind: 'invalid_iri' }
    const pubB: PublicParseError = { kind: 'invalid_iri', path: '$.iri' }
    expect(pubA).not.toHaveProperty('path')
    expect(pubB.path).toBe('$.iri')
  })

  it('SerializationError is an Error class with code + details', () => {
    const e = new SerializationError('invalid_application_object', 'bad', { field: 'foo' })
    expect(e).toBeInstanceOf(Error)
    expect(e).toBeInstanceOf(SerializationError)
    expect(e.code).toBe('invalid_application_object')
    expect(e.details).toStrictEqual({ field: 'foo' })
  })

  it('invalid_pointer carries the right shape (v3)', () => {
    const ip: ParseError = {
      kind: 'invalid_pointer',
      pointer: '/foo/__missing/bar',
      reason: 'segment_missing',
      path: '/foo/__missing',
    }
    expect(ip.kind).toBe('invalid_pointer')
  })
})
