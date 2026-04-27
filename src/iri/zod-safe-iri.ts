// src/iri/zod-safe-iri.ts
import { z } from 'zod'
import type { ParseError } from '../result.js'
import type { SafeIri } from './strategy.js'
import { type ValidateIriOpts, validateIri } from './validate.js'

/**
 * Marker key so per-class deserializers can recognise issues from this helper
 * (vs other custom-coded issues a schema author might emit).
 */
const SAFE_IRI_PARAMS_MARKER = '__safe_iri__' as const

interface SafeIriIssueParams {
  readonly [SAFE_IRI_PARAMS_MARKER]: true
  readonly kind: 'invalid_iri'
  readonly got: string
  readonly reason: 'malformed' | 'disallowed_scheme' | 'disallowed_host' | 'has_userinfo'
}

/**
 * Zod helper for IRI-shaped fields. Use in every per-class schema for IRI fields:
 *   shipmentInformation: safeIri().optional()
 *   containedPieces: z.array(safeIri()).min(1).optional()
 *
 * On failure, emits a `custom` Zod issue with a structured `params` payload
 * tagged with `__safe_iri__: true`. Per-class deserializers walk the Zod
 * issues, lift any safeIri-tagged issue into a `kind: 'invalid_iri'` ParseError
 * (see `findInvalidIriInIssues` below), and only fall through to
 * `kind: 'zod_validation'` if no IRI issues are present.
 *
 * v3 (A1-R2-B1): v2 emitted only a string message, which forced every IRI
 * failure into `zod_validation` and broke discriminated-union routing for
 * Tracks B/C and the negative-test catalogue (T48a invalid-iri.test.ts).
 */
export function safeIri(opts: ValidateIriOpts = {}) {
  return z.string().transform((s, ctx): SafeIri => {
    const r = validateIri(s, opts)
    if (!r.ok) {
      // r.error.kind is always 'invalid_iri' from validateIri; narrow defensively
      const reason = r.error.kind === 'invalid_iri' ? r.error.reason : 'malformed'
      const params: SafeIriIssueParams = {
        [SAFE_IRI_PARAMS_MARKER]: true,
        kind: 'invalid_iri',
        got: s,
        reason,
      }
      ctx.addIssue({ code: 'custom', message: 'invalid_iri', params })
      return z.NEVER as never
    }
    return r.value
  })
}

/**
 * Walk a single Zod issue; if it came from `safeIri()` (recognisable via the
 * `__safe_iri__` marker on `params`), return a ParseError of kind `invalid_iri`.
 * Otherwise return null so the caller can fall through to `zod_validation`.
 */
export function extractInvalidIriIssue(
  issue: { code?: string; message?: string; path: ReadonlyArray<PropertyKey>; params?: unknown },
  path: string,
): Extract<ParseError, { kind: 'invalid_iri' }> | null {
  if (issue.code !== 'custom' || issue.message !== 'invalid_iri') return null
  const p = issue.params as Partial<SafeIriIssueParams> | undefined
  if (!p || p[SAFE_IRI_PARAMS_MARKER] !== true) return null
  if (p.kind !== 'invalid_iri') return null
  return {
    kind: 'invalid_iri',
    got: p.got ?? '',
    reason: p.reason ?? 'malformed',
    path,
  }
}

/**
 * Walk an entire Zod issue collection; return the FIRST safeIri-tagged issue
 * lifted to ParseError (or null if none). Per-class deserializers prefer this
 * to the per-issue helper because the negative-test catalogue asserts
 * `r.error.kind === 'invalid_iri'` on the FIRST IRI failure.
 */
export function findInvalidIriInIssues(
  issues: ReadonlyArray<{
    code?: string
    message?: string
    path: ReadonlyArray<PropertyKey>
    params?: unknown
  }>,
  envelopePathPrefix = '$',
): Extract<ParseError, { kind: 'invalid_iri' }> | null {
  for (const issue of issues) {
    const dotted =
      issue.path.length === 0
        ? envelopePathPrefix
        : `${envelopePathPrefix}.${issue.path.map(String).join('.')}`
    const extracted = extractInvalidIriIssue(issue, dotted)
    if (extracted) return extracted
  }
  return null
}
