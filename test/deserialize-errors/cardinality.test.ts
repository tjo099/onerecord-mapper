import { describe, expect, it } from 'vitest'
import { deserializeWaybill } from '../../src/classes/waybill/index.js'
import { createWaybill } from '../factories/waybill.js'

describe('deserialize -> cardinality_violation', () => {
  it('rejects top-level empty array as cardinality_violation', () => {
    const r = deserializeWaybill({
      ...createWaybill(),
      referredBookingOption: [],
    })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe('cardinality_violation')
      if (r.error.kind === 'cardinality_violation') {
        expect(r.error.field).toBe('referredBookingOption')
      }
    }
  })

  it('threads opts.meta into error (v3 — A3-R2-m3)', () => {
    const r = deserializeWaybill(
      { ...createWaybill(), referredBookingOption: [] },
      { meta: { requestId: 'rq1' } },
    )
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.meta).toStrictEqual({ requestId: 'rq1' })
  })
})
