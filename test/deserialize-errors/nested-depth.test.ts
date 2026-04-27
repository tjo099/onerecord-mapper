import { describe, expect, it } from 'vitest'
import { deserializeWaybill } from '../../src/classes/waybill/index.js'

describe('deserialize -> nested-depth (depth + node-count limits)', () => {
  it('triggers depth_limit_exceeded with maxDepth = 1', () => {
    const deep = {
      '@context': 'https://onerecord.iata.org/ns/cargo',
      '@type': 'Waybill',
      '@id': 'https://x/y/z',
      a: { b: { c: 1 } },
    }
    const r = deserializeWaybill(deep, { limits: { maxDepth: 1 } })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('depth_limit_exceeded')
  })

  it('triggers node_count_limit_exceeded with maxNodes = 3', () => {
    const wide = {
      '@context': 'https://onerecord.iata.org/ns/cargo',
      '@type': 'Waybill',
      '@id': 'https://x/y/z',
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    }
    const r = deserializeWaybill(wide, { limits: { maxNodes: 3 } })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('node_count_limit_exceeded')
  })

  it('threads opts.meta into error (v3 — A3-R2-m3)', () => {
    const r = deserializeWaybill(
      {
        '@context': 'https://onerecord.iata.org/ns/cargo',
        '@type': 'Waybill',
        '@id': 'https://x/y/z',
        a: { b: { c: 1 } },
      },
      { limits: { maxDepth: 1 }, meta: { requestId: 'rq1' } },
    )
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.meta).toStrictEqual({ requestId: 'rq1' })
  })
})
