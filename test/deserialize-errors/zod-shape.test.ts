import { describe, expect, it } from 'vitest'
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

  it.skip('change_partial_failure (Phase 9 — applyChange)', () => {
    // Filled in when applyChange lands.
  })

  it.skip('incompatible_ontology_version (Phase 5+ — version mismatch via assertOntologyVersion)', () => {
    // Already covered by ontology-version-check.test.ts — placeholder retained
    // here because PARSE_ERROR_KIND_TO_FILE points incompatible_ontology_version
    // at zod-shape.test.ts.
  })
})
