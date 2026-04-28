import { describe, expect, it } from 'vitest'
import { WaybillCodec, applyChange } from '../../src/index.js'
import type { Change } from '../../src/classes/change/schema.js'
import type { Waybill } from '../../src/classes/waybill/schema.js'
import { deserializeWaybill } from '../../src/classes/waybill/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { createWaybill } from '../factories/waybill.js'

describe('deserialize -> zod_validation + adjacent shape errors', () => {
  it('zod_validation: missing @id', () => {
    const wire = { '@context': CARGO_CONTEXT_IRI, '@type': 'Waybill' }
    const r = deserializeWaybill(wire)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('zod_validation')
  })

  it('zod_validation: unknown key under .strict() (no silent strip — A1-M7)', () => {
    const r = deserializeWaybill({ ...createWaybill(), unknownExtraKey: 'bar' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('zod_validation')
  })

  it('zod_validation: wrong @type literal', () => {
    const r = deserializeWaybill({ ...createWaybill(), '@type': 'NotWaybill' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('zod_validation')
  })

  it('threads opts.meta into error (v3 — A3-R2-m3)', () => {
    const r = deserializeWaybill(
      { '@context': CARGO_CONTEXT_IRI, '@type': 'Waybill' },
      { meta: { requestId: 'rq1' } },
    )
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.meta).toStrictEqual({ requestId: 'rq1' })
  })

  it('change_partial_failure: applyChange wraps post-apply zod failure', () => {
    const wb: Waybill = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'Waybill',
      '@id': 'https://test.example/test/waybill/wb1',
      waybillType: 'MASTER',
      waybillPrefix: '123',
      waybillNumber: '12345678',
    }
    // Two ops: the first replaces waybillPrefix with a valid 3-digit value;
    // the second replaces waybillNumber with a non-8-digit value, which the
    // post-apply codec re-validation rejects (waybillNumber = /^\d{8}$/).
    const change: Change = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'Change',
      '@id': 'https://test.example/test/change/c1',
      hasOperation: [
        {
          '@context': CARGO_CONTEXT_IRI,
          '@type': 'Operation',
          '@id': 'https://test.example/test/operation/op1',
          op: 'ADD',
          path: '/waybillPrefix',
          value: '999',
        },
        {
          '@context': CARGO_CONTEXT_IRI,
          '@type': 'Operation',
          '@id': 'https://test.example/test/operation/op2',
          op: 'ADD',
          path: '/waybillNumber',
          value: 'abc',
        },
      ],
    }
    const r = applyChange(WaybillCodec, wb, change)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe('change_partial_failure')
    }
  })

  it.skip('incompatible_ontology_version (Phase 5+ — version mismatch via assertOntologyVersion)', () => {
    // Already covered by ontology-version-check.test.ts — placeholder retained
    // here because PARSE_ERROR_KIND_TO_FILE points incompatible_ontology_version
    // at zod-shape.test.ts.
  })
})
