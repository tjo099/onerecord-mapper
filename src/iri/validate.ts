// src/iri/validate.ts
import type { ParseResult } from '../result.js'
import type { SafeIri } from './strategy.js'

const ALWAYS_FORBIDDEN_SCHEMES = new Set(['javascript', 'data', 'file', 'vbscript', 'about'])

export interface ValidateIriOpts {
  allowedSchemes?: readonly string[]
  allowedHosts?: readonly string[]
}

const DEFAULT_ALLOWED_SCHEMES: readonly string[] = ['https']

function checkScheme(scheme: string, allowed: readonly string[], iri: string): ParseResult<true> {
  if (ALWAYS_FORBIDDEN_SCHEMES.has(scheme)) {
    return {
      ok: false,
      error: { kind: 'invalid_iri', got: iri, reason: 'disallowed_scheme', path: '$' },
    }
  }
  if (!allowed.includes(scheme)) {
    return {
      ok: false,
      error: { kind: 'invalid_iri', got: iri, reason: 'disallowed_scheme', path: '$' },
    }
  }
  return { ok: true, value: true }
}

export function validateIri(iri: string, opts: ValidateIriOpts = {}): ParseResult<SafeIri> {
  const allowedSchemes = opts.allowedSchemes ?? DEFAULT_ALLOWED_SCHEMES
  const allowedHosts = opts.allowedHosts

  // First detect scheme via regex — reliable for both HTTP and non-HTTP (urn:, etc.)
  const schemeMatch = iri.match(/^([a-zA-Z][a-zA-Z0-9+.\-]*):/)
  if (!schemeMatch) {
    return { ok: false, error: { kind: 'invalid_iri', got: iri, reason: 'malformed', path: '$' } }
  }
  const scheme = (schemeMatch[1] ?? '').toLowerCase()
  const schemeR = checkScheme(scheme, allowedSchemes, iri)
  if (!schemeR.ok) return schemeR

  // Try to parse via URL for HTTP-shaped schemes; fall back to NFC-normalized exact for non-URL-shaped
  let url: URL | null = null
  try {
    url = new URL(iri)
  } catch {
    return { ok: true, value: iri.normalize('NFC') as SafeIri }
  }

  if (url.username !== '' || url.password !== '') {
    return {
      ok: false,
      error: { kind: 'invalid_iri', got: iri, reason: 'has_userinfo', path: '$' },
    }
  }
  if (allowedHosts && url.host !== '' && !allowedHosts.includes(url.host)) {
    return {
      ok: false,
      error: { kind: 'invalid_iri', got: iri, reason: 'disallowed_host', path: '$' },
    }
  }
  // For HTTP(S), normalize via .href; for non-HTTP that parsed (urn:uuid), prefer original (NFC)
  const value =
    url.protocol === 'https:' || url.protocol === 'http:' ? url.href : iri.normalize('NFC')
  return { ok: true, value: value as SafeIri }
}
