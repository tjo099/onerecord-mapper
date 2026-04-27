// test/unit/error/redact.test.ts
import { describe, expect, it } from 'vitest'
import { redactError } from '../../../src/error/redact.js'
import type { ParseError } from '../../../src/result.js'

describe('redactError — strips everything except kind + path', () => {
  it('preserves kind and path when path is present', () => {
    const e: ParseError = { kind: 'missing_type', path: '$.node' }
    const r = redactError(e)
    expect(r.kind).toBe('missing_type')
    expect(r.path).toBe('$.node')
    expect(Object.keys(r)).toEqual(['kind', 'path'])
  })

  it('preserves only kind when no path field (circular_reference)', () => {
    const e: ParseError = { kind: 'circular_reference', cyclePath: ['a', 'b', 'a'] }
    const r = redactError(e)
    expect(r.kind).toBe('circular_reference')
    expect('path' in r).toBe(false)
    expect(Object.keys(r)).toEqual(['kind'])
  })

  it('does not leak got/expected/reason/etc', () => {
    const e: ParseError = {
      kind: 'invalid_iri',
      got: 'ftp://secret.internal',
      reason: 'disallowed_scheme',
      path: '$.id',
    }
    const r = redactError(e)
    expect('got' in r).toBe(false)
    expect('reason' in r).toBe(false)
  })

  it('does not leak zod issues', () => {
    const e: ParseError = {
      kind: 'zod_validation',
      issues: [{ path: 'secret', message: 'secret details', code: 'c' }],
    }
    const r = redactError(e)
    expect('issues' in r).toBe(false)
  })

  it('does not leak cyclePath', () => {
    const e: ParseError = { kind: 'circular_reference', cyclePath: ['x', 'y'] }
    const r = redactError(e)
    expect('cyclePath' in r).toBe(false)
  })

  it('does not leak pointer in invalid_pointer', () => {
    const e: ParseError = {
      kind: 'invalid_pointer',
      pointer: '/internal/path',
      reason: 'segment_missing',
      path: '$.op',
    }
    const r = redactError(e)
    expect('pointer' in r).toBe(false)
    expect('reason' in r).toBe(false)
    expect(r.kind).toBe('invalid_pointer')
    expect(r.path).toBe('$.op')
  })

  it('does not leak meta', () => {
    const e: ParseError = {
      kind: 'payload_too_large',
      sizeBytes: 9_000_000,
      limitBytes: 5_000_000,
      meta: { internal: true },
    }
    const r = redactError(e)
    expect('meta' in r).toBe(false)
    expect('sizeBytes' in r).toBe(false)
  })
})
