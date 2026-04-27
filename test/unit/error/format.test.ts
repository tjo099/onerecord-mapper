// test/unit/error/format.test.ts
import { describe, expect, it } from 'vitest'
import { formatError } from '../../../src/error/format.js'
import type { ParseError } from '../../../src/result.js'

describe('formatError — exhaustive over 22 ParseError kinds', () => {
  it('unknown_context includes kind name', () => {
    const e: ParseError = {
      kind: 'unknown_context',
      got: 'https://bad',
      expected: ['https://onerecord.iata.org/ns/cargo'],
      path: '$',
    }
    expect(formatError(e)).toContain('unknown_context')
    expect(formatError(e)).toContain('https://bad')
  })

  it('mixed_context includes kind name', () => {
    const e: ParseError = { kind: 'mixed_context', got: ['a', 'b'], allowed: ['c'], path: '$.x' }
    expect(formatError(e)).toContain('mixed_context')
    expect(formatError(e)).toContain('$.x')
  })

  it('missing_type includes kind name', () => {
    const e: ParseError = { kind: 'missing_type', path: '$.node' }
    expect(formatError(e)).toContain('missing_type')
    expect(formatError(e)).toContain('$.node')
  })

  it('missing_type with objectId', () => {
    const e: ParseError = { kind: 'missing_type', path: '$.node', objectId: 'urn:x' }
    expect(formatError(e)).toContain('urn:x')
  })

  it('unknown_type includes kind name', () => {
    const e: ParseError = { kind: 'unknown_type', got: 'BadType', path: '$' }
    expect(formatError(e)).toContain('unknown_type')
    expect(formatError(e)).toContain('BadType')
  })

  it('wrong_type_for_endpoint includes kind name', () => {
    const e: ParseError = {
      kind: 'wrong_type_for_endpoint',
      expected: 'Waybill',
      got: 'Piece',
      path: '$',
    }
    expect(formatError(e)).toContain('wrong_type_for_endpoint')
    expect(formatError(e)).toContain('Waybill')
    expect(formatError(e)).toContain('Piece')
  })

  it('missing_id includes kind name', () => {
    const e: ParseError = { kind: 'missing_id', objectType: 'Waybill', path: '$' }
    expect(formatError(e)).toContain('missing_id')
    expect(formatError(e)).toContain('Waybill')
  })

  it('invalid_iri includes kind name and reason', () => {
    const e: ParseError = {
      kind: 'invalid_iri',
      got: 'ftp://x',
      reason: 'disallowed_scheme',
      path: '$.id',
    }
    expect(formatError(e)).toContain('invalid_iri')
    expect(formatError(e)).toContain('disallowed_scheme')
    expect(formatError(e)).toContain('ftp://x')
  })

  it('duplicate_id_in_graph includes kind name', () => {
    const e: ParseError = { kind: 'duplicate_id_in_graph', iri: 'https://a/b', path: '$' }
    expect(formatError(e)).toContain('duplicate_id_in_graph')
    expect(formatError(e)).toContain('https://a/b')
  })

  it('cardinality_violation includes kind name', () => {
    const e: ParseError = {
      kind: 'cardinality_violation',
      field: 'pieces',
      expected: '1',
      got: 3,
      path: '$.pieces',
    }
    expect(formatError(e)).toContain('cardinality_violation')
    expect(formatError(e)).toContain('pieces')
    expect(formatError(e)).toContain('3')
  })

  it('circular_reference includes kind name and cycle', () => {
    const e: ParseError = { kind: 'circular_reference', cyclePath: ['a', 'b', 'a'] }
    expect(formatError(e)).toContain('circular_reference')
    expect(formatError(e)).toContain('a -> b -> a')
  })

  it('zod_validation includes kind name and issue count', () => {
    const e: ParseError = {
      kind: 'zod_validation',
      issues: [{ path: '$.x', message: 'bad', code: 'invalid_type' }],
    }
    expect(formatError(e)).toContain('zod_validation')
    expect(formatError(e)).toContain('1 issue(s)')
  })

  it('zod_validation with empty issues uses $', () => {
    const e: ParseError = { kind: 'zod_validation', issues: [] }
    expect(formatError(e)).toContain('$')
  })

  it('forbidden_state_transition includes kind name', () => {
    const e: ParseError = {
      kind: 'forbidden_state_transition',
      from: 'PENDING',
      to: 'CLOSED',
      path: '$.status',
    }
    expect(formatError(e)).toContain('forbidden_state_transition')
    expect(formatError(e)).toContain('PENDING')
    expect(formatError(e)).toContain('CLOSED')
  })

  it('forbidden_state_transition with reason', () => {
    const e: ParseError = {
      kind: 'forbidden_state_transition',
      from: 'PENDING',
      to: 'CLOSED',
      reason: 'not allowed',
      path: '$',
    }
    expect(formatError(e)).toContain('not allowed')
  })

  it('operation_field_not_allowed includes kind name', () => {
    const e: ParseError = {
      kind: 'operation_field_not_allowed',
      field: 'id',
      allowedFields: ['name', 'code'],
    }
    expect(formatError(e)).toContain('operation_field_not_allowed')
    expect(formatError(e)).toContain('id')
    expect(formatError(e)).toContain('name')
  })

  it('change_partial_failure includes kind name and cause', () => {
    const cause: ParseError = { kind: 'missing_type', path: '$.x' }
    const e: ParseError = { kind: 'change_partial_failure', failedAt: 2, total: 5, cause }
    expect(formatError(e)).toContain('change_partial_failure')
    expect(formatError(e)).toContain('#2/5')
    expect(formatError(e)).toContain('missing_type')
  })

  it('payload_too_large includes kind name', () => {
    const e: ParseError = {
      kind: 'payload_too_large',
      sizeBytes: 10_000_000,
      limitBytes: 5_000_000,
    }
    expect(formatError(e)).toContain('payload_too_large')
    expect(formatError(e)).toContain('10000000')
    expect(formatError(e)).toContain('5000000')
  })

  it('depth_limit_exceeded includes kind name', () => {
    const e: ParseError = { kind: 'depth_limit_exceeded', depth: 40, limit: 32, path: '$.a.b' }
    expect(formatError(e)).toContain('depth_limit_exceeded')
    expect(formatError(e)).toContain('40')
    expect(formatError(e)).toContain('32')
  })

  it('node_count_limit_exceeded includes kind name', () => {
    const e: ParseError = { kind: 'node_count_limit_exceeded', count: 15000, limit: 10000 }
    expect(formatError(e)).toContain('node_count_limit_exceeded')
    expect(formatError(e)).toContain('15000')
  })

  it('string_too_long includes kind name', () => {
    const e: ParseError = { kind: 'string_too_long', length: 100000, limit: 65536, path: '$.field' }
    expect(formatError(e)).toContain('string_too_long')
    expect(formatError(e)).toContain('100000')
  })

  it('array_too_long includes kind name', () => {
    const e: ParseError = { kind: 'array_too_long', length: 9000, limit: 5000, path: '$.items' }
    expect(formatError(e)).toContain('array_too_long')
    expect(formatError(e)).toContain('9000')
  })

  it('prototype_pollution_attempt includes kind name', () => {
    const e: ParseError = { kind: 'prototype_pollution_attempt', key: '__proto__', path: '$' }
    expect(formatError(e)).toContain('prototype_pollution_attempt')
    expect(formatError(e)).toContain('__proto__')
  })

  it('incompatible_ontology_version includes kind name', () => {
    const e: ParseError = {
      kind: 'incompatible_ontology_version',
      serverVersion: '2.0.0',
      mapperVersion: '1.0.0',
    }
    expect(formatError(e)).toContain('incompatible_ontology_version')
    expect(formatError(e)).toContain('2.0.0')
    expect(formatError(e)).toContain('1.0.0')
  })

  it('invalid_pointer includes kind name, reason, and pointer (v3)', () => {
    const e: ParseError = {
      kind: 'invalid_pointer',
      pointer: '/a/b',
      reason: 'segment_missing',
      path: '$.op[0]',
    }
    expect(formatError(e)).toContain('invalid_pointer')
    expect(formatError(e)).toContain('segment_missing')
    expect(formatError(e)).toContain('/a/b')
  })
})
