import { describe, expect, it } from 'vitest'
import { deserializeWaybill } from '../../src/classes/waybill/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'

describe('deserialize -> blank_node_forbidden (deviation #8 closure)', () => {
  it('rejects a blank-node @id at the root', () => {
    const wire = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'Waybill',
      '@id': '_:b0',
      waybillType: 'MASTER',
      waybillPrefix: '123',
      waybillNumber: '12345678',
    }
    const r = deserializeWaybill(wire)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe('blank_node_forbidden')
      if (r.error.kind === 'blank_node_forbidden') {
        expect(r.error.blankId).toBe('_:b0')
      }
    }
  })

  it('rejects a blank-node @id on a nested object', () => {
    const wire = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'Waybill',
      '@id': 'https://example/wb',
      waybillType: 'MASTER',
      waybillPrefix: '123',
      waybillNumber: '12345678',
      // Nested blank node — should still be rejected.
      totalGrossWeight: { '@id': '_:weight1', unit: 'KGM', value: 100 },
    }
    const r = deserializeWaybill(wire)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe('blank_node_forbidden')
      if (r.error.kind === 'blank_node_forbidden') {
        expect(r.error.blankId).toBe('_:weight1')
      }
    }
  })

  it('accepts well-formed @id values that happen to start with non-blank-node patterns', () => {
    const wire = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'Waybill',
      '@id': 'https://example/wb-with-underscore_value',
      waybillType: 'MASTER',
      waybillPrefix: '123',
      waybillNumber: '12345678',
    }
    const r = deserializeWaybill(wire)
    expect(r.ok).toBe(true)
  })

  it('threads opts.meta into the blank-node error', () => {
    const wire = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'Waybill',
      '@id': '_:rootnode',
      waybillType: 'MASTER',
      waybillPrefix: '123',
      waybillNumber: '12345678',
    }
    const r = deserializeWaybill(wire, { meta: { req: 'r1' } })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.meta).toStrictEqual({ req: 'r1' })
  })
})
