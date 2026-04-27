// test/unit/iri/validate.test.ts
import { describe, expect, it } from 'vitest'
import { validateIri } from '../../../src/iri/validate.js'

describe('validateIri', () => {
  it('accepts a plain https URL with default opts', () => {
    expect(validateIri('https://flaks.example/t1/waybill/u1').ok).toBe(true)
  })

  it('rejects http when allowedSchemes is the default ["https"]', () => {
    const r = validateIri('http://flaks.example/t1/x/u1')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatchObject({ kind: 'invalid_iri', reason: 'disallowed_scheme' })
  })

  it('rejects javascript:/data:/file: even if explicitly listed', () => {
    for (const iri of ['javascript:alert(1)', 'data:text/html;base64,abc', 'file:///etc/passwd']) {
      const r = validateIri(iri, { allowedSchemes: ['javascript', 'data', 'file'] })
      expect(r.ok).toBe(false)
    }
  })

  it('rejects URL with userinfo', () => {
    const r = validateIri('https://attacker:pw@flaks.example/x', { allowedSchemes: ['https'] })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatchObject({ kind: 'invalid_iri', reason: 'has_userinfo' })
  })

  it('enforces allowedHosts if provided', () => {
    const r = validateIri('https://attacker.example/x', {
      allowedSchemes: ['https'],
      allowedHosts: ['flaks.example'],
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatchObject({ kind: 'invalid_iri', reason: 'disallowed_host' })
  })

  it('returns malformed for non-URL input', () => {
    const r = validateIri('not a url')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatchObject({ kind: 'invalid_iri', reason: 'malformed' })
  })

  it('accepts non-HTTP IRI when scheme allowlist permits (urn:)', () => {
    // v2 fix (A1-m3): new URL('urn:...') succeeds in modern Node — must route through scheme check
    const r = validateIri('urn:uuid:550e8400-e29b-41d4-a716-446655440000', {
      allowedSchemes: ['urn'],
    })
    expect(r.ok).toBe(true)
  })

  it('rejects parseable non-HTTP IRI when scheme not in allowlist', () => {
    const r = validateIri('urn:uuid:550e8400-e29b-41d4-a716-446655440000') // default ['https']
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatchObject({ kind: 'invalid_iri', reason: 'disallowed_scheme' })
  })
})
