// test/unit/classes/shared/logistics-object.test.ts
import { describe, expect, it } from 'vitest'
import { LogisticsObjectSchema } from '../../../../src/classes/shared/logistics-object.js'
import { CARGO_CONTEXT_IRI } from '../../../../src/version.js'

describe('LogisticsObject (abstract supertype)', () => {
  it('accepts a minimal valid envelope', () => {
    const r = LogisticsObjectSchema.safeParse({
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'Waybill',
      '@id': 'https://flaks.example/wf/waybill/abc',
    })
    expect(r.success).toBe(true)
  })

  it('rejects when @id is missing', () => {
    const r = LogisticsObjectSchema.safeParse({
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'Waybill',
    })
    expect(r.success).toBe(false)
  })

  it('schema is loose on @context: any string passes (allowlist via assertContextAllowed helper, v2)', () => {
    // v2 amendment (A1-M4): schema accepts any string @context; allowlist enforcement
    // happens in per-class deserialize.ts via assertContextAllowed (Task 11), not here.
    const r = LogisticsObjectSchema.safeParse({
      '@context': 'https://attacker.example/ns',
      '@type': 'Waybill',
      '@id': 'https://flaks.example/wf/waybill/abc',
    })
    expect(r.success).toBe(true)
  })

  it('strict mode rejects unknown keys (v2 — A1-M7)', () => {
    const r = LogisticsObjectSchema.safeParse({
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'Waybill',
      '@id': 'https://flaks.example/wf/waybill/abc',
      futureField: 'unknown',
    })
    expect(r.success).toBe(false)
  })

  it('accepts array @context (v2)', () => {
    const r = LogisticsObjectSchema.safeParse({
      '@context': [CARGO_CONTEXT_IRI, 'https://other.example/ns'],
      '@type': 'Waybill',
      '@id': 'https://flaks.example/wf/waybill/abc',
    })
    expect(r.success).toBe(true)
  })
})
