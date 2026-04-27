import { describe, expect, it } from 'vitest'
import { deserializeWaybill } from '../../src/classes/waybill/index.js'
import { createWaybill } from '../factories/waybill.js'

describe('deserialize -> unknown_context', () => {
  it('rejects single unknown @context string', () => {
    const r = deserializeWaybill({
      ...createWaybill(),
      '@context': 'https://attacker.example/ns',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('unknown_context')
  })

  it('rejects array-form @context with all-unallowed members (v2 — A1-M4)', () => {
    const r = deserializeWaybill({
      ...createWaybill(),
      '@context': ['https://attacker.example/a', 'https://attacker.example/b'],
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('unknown_context')
  })

  it('threads opts.meta into error (v3 — A3-R2-m3)', () => {
    const r = deserializeWaybill(
      { ...createWaybill(), '@context': 'https://attacker.example/ns' },
      { meta: { requestId: 'rq1' } },
    )
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.meta).toStrictEqual({ requestId: 'rq1' })
  })
})
