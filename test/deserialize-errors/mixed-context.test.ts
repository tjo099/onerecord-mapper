import { describe, expect, it } from 'vitest'
import { deserializeWaybill } from '../../src/classes/waybill/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { createWaybill } from '../factories/waybill.js'

describe('deserialize -> mixed_context', () => {
  it('rejects array @context with mixed allowed/unallowed members', () => {
    // assertContextAllowed emits mixed_context when at least one member is
    // in the allowlist AND at least one member is not in the allowlist.
    const r = deserializeWaybill({
      ...createWaybill(),
      '@context': [CARGO_CONTEXT_IRI, 'https://attacker.example/ns'],
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('mixed_context')
  })

  it('threads opts.meta into error (v3 — A3-R2-m3)', () => {
    const r = deserializeWaybill(
      {
        ...createWaybill(),
        '@context': [CARGO_CONTEXT_IRI, 'https://attacker.example/ns'],
      },
      { meta: { requestId: 'rq1' } },
    )
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.meta).toStrictEqual({ requestId: 'rq1' })
  })
})
