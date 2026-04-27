import { describe, expect, it } from 'vitest'
import { deserializeWaybill } from '../../src/classes/waybill/index.js'
import { createWaybill } from '../factories/waybill.js'

describe('deserialize -> invalid_iri (v3 — A1-R2-B1: surfaces from safeIri, NOT zod_validation)', () => {
  it('surfaces invalid_iri for a disallowed-scheme IRI in shipmentInformation', () => {
    const r = deserializeWaybill({
      ...createWaybill(),
      shipmentInformation: 'http://attacker',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe('invalid_iri')
      if (r.error.kind === 'invalid_iri') {
        expect(r.error.reason).toBe('disallowed_scheme')
        expect(r.error.path).toContain('shipmentInformation')
      }
    }
  })

  it('surfaces invalid_iri for malformed IRI', () => {
    const r = deserializeWaybill({
      ...createWaybill(),
      shipmentInformation: 'not a url at all',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('invalid_iri')
  })

  it('surfaces invalid_iri for IRI with userinfo (https://user:pw@host)', () => {
    const r = deserializeWaybill({
      ...createWaybill(),
      shipmentInformation: 'https://user:pw@flaks.example/x',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe('invalid_iri')
      if (r.error.kind === 'invalid_iri') expect(r.error.reason).toBe('has_userinfo')
    }
  })

  it('threads opts.meta into error (v3 — A3-R2-m3)', () => {
    const r = deserializeWaybill(
      { ...createWaybill(), shipmentInformation: 'http://attacker' },
      { meta: { requestId: 'rq1' } },
    )
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.meta).toStrictEqual({ requestId: 'rq1' })
  })
})
