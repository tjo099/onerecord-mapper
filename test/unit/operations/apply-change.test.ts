import { describe, expect, it } from 'vitest'
import { WaybillCodec, WaybillSchema } from '../../../src/classes/waybill/index.js'
import { applyChange } from '../../../src/operations/apply-change.js'
import { createWaybill } from '../../factories/waybill.js'

describe('applyChange (v3)', () => {
  it('ADD on a missing field succeeds', () => {
    const wb = WaybillSchema.parse(createWaybill())
    const r = applyChange(WaybillCodec, wb, {
      hasOperation: [{ op: 'ADD', path: '/totalGrossWeight', value: { unit: 'KGM', value: 100 } }],
    })
    expect(r.ok).toBe(true)
  })

  it('DELETE on a present field succeeds', () => {
    const wb = WaybillSchema.parse(createWaybill({ totalGrossWeight: { unit: 'KGM', value: 50 } }))
    const r = applyChange(WaybillCodec, wb, {
      hasOperation: [{ op: 'DELETE', path: '/totalGrossWeight' }],
    })
    expect(r.ok).toBe(true)
  })

  it('empty hasOperation is graceful no-op', () => {
    const wb = WaybillSchema.parse(createWaybill())
    const r = applyChange(WaybillCodec, wb, { hasOperation: [] })
    expect(r.ok).toBe(true)
  })

  // v3 (A1-R2-B2): traversal failures surface as invalid_pointer, NOT invalid_iri
  it('rejects empty path as invalid_pointer (v3)', () => {
    const wb = WaybillSchema.parse(createWaybill())
    const r = applyChange(WaybillCodec, wb, { hasOperation: [{ op: 'ADD', path: '/', value: 1 }] })
    expect(r.ok).toBe(false)
    if (!r.ok && r.error.kind === 'change_partial_failure') {
      expect(r.error.cause.kind).toBe('invalid_pointer')
    }
  })

  it('rejects non-object intermediate as invalid_pointer (v3)', () => {
    const wb = WaybillSchema.parse(createWaybill())
    // waybillNumber is a string; traversing through it must fail
    const r = applyChange(WaybillCodec, wb, {
      hasOperation: [{ op: 'ADD', path: '/waybillNumber/inside', value: 1 }],
    })
    expect(r.ok).toBe(false)
    if (!r.ok && r.error.kind === 'change_partial_failure') {
      expect(r.error.cause.kind).toBe('invalid_pointer')
      if (r.error.cause.kind === 'invalid_pointer')
        expect(r.error.cause.reason).toBe('segment_not_object')
    }
  })
})
