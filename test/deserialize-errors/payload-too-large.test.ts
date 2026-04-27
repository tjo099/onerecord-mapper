import { describe, expect, it } from 'vitest'
import { deserializeWaybill } from '../../src/classes/waybill/index.js'
import { createWaybill } from '../factories/waybill.js'

describe('deserialize -> payload_too_large', () => {
  it('rejects when explicit payloadByteLength exceeds limit', () => {
    const r = deserializeWaybill(createWaybill(), {
      limits: { maxPayloadBytes: 100 },
      payloadByteLength: 1000,
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('payload_too_large')
  })

  it('threads opts.meta into error (v3 — A3-R2-m3)', () => {
    const r = deserializeWaybill(createWaybill(), {
      limits: { maxPayloadBytes: 100 },
      payloadByteLength: 1000,
      meta: { requestId: 'rq1' },
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.meta).toStrictEqual({ requestId: 'rq1' })
  })
})
