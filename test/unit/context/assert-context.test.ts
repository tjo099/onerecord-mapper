// test/unit/context/assert-context.test.ts
import { describe, expect, it } from 'vitest'
import {
  ALLOWED_CONTEXTS,
  API_CONTEXT_IRI,
  CARGO_CONTEXT_IRI,
  assertContextAllowed,
} from '../../../src/context.js'

describe('assertContextAllowed', () => {
  it('accepts a single allowed string', () => {
    expect(assertContextAllowed(CARGO_CONTEXT_IRI).ok).toBe(true)
    expect(assertContextAllowed(API_CONTEXT_IRI).ok).toBe(true)
  })

  it('rejects single unknown string with unknown_context', () => {
    const r = assertContextAllowed('https://attacker.example/ns')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('unknown_context')
  })

  it('accepts array where every member is allowed', () => {
    expect(assertContextAllowed([CARGO_CONTEXT_IRI, API_CONTEXT_IRI]).ok).toBe(true)
  })

  it('rejects array of all-unallowed as unknown_context', () => {
    const r = assertContextAllowed(['https://attacker/x', 'https://attacker/y'])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('unknown_context')
  })

  it('rejects array with both allowed and unallowed as mixed_context', () => {
    const r = assertContextAllowed([CARGO_CONTEXT_IRI, 'https://attacker/x'])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('mixed_context')
  })

  it('honours opts.allowedContexts override (spec §5.2 DeserializeOpts.allowedContexts)', () => {
    const r = assertContextAllowed('https://custom.example/ns', {
      allowedContexts: ['https://custom.example/ns'],
    })
    expect(r.ok).toBe(true)
  })

  it('threads meta into error for correlation', () => {
    const r = assertContextAllowed('bad', { meta: { requestId: 'r1' } })
    if (!r.ok) expect(r.error.meta).toStrictEqual({ requestId: 'r1' })
  })
})
