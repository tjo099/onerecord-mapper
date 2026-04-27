// src/context.ts
import type { ParseResult } from './result.js'

export const CARGO_CONTEXT_IRI = 'https://onerecord.iata.org/ns/cargo' as const
export const API_CONTEXT_IRI = 'https://onerecord.iata.org/ns/api' as const

export const ALLOWED_CONTEXTS: readonly string[] = Object.freeze([
  CARGO_CONTEXT_IRI,
  API_CONTEXT_IRI,
])

/**
 * Per-call override for context allowlist (DeserializeOpts.allowedContexts).
 * `path` is always `$['@context']` for envelope-level checks.
 */
export interface AssertContextOpts {
  allowedContexts?: readonly string[]
  meta?: Record<string, unknown>
}

/**
 * Validate an envelope's `@context` (string or array form) against the allowlist.
 * Returns `ok: true` on pass; `ok: false` with `unknown_context` (single bad string,
 * or array containing exclusively unallowed) or `mixed_context` (array containing
 * both allowed and unallowed members).
 *
 * Spec §7.1 + §13: `@context` is matched as opaque string against an allowlist;
 * no network resolution. Array form is permitted; every member must be in the
 * allowlist.
 */
export function assertContextAllowed(
  context: unknown,
  opts: AssertContextOpts = {},
): ParseResult<true> {
  const allowed = opts.allowedContexts ?? ALLOWED_CONTEXTS
  const path = '$["@context"]'
  const metaSlice = opts.meta ? { meta: opts.meta } : {}
  if (typeof context === 'string') {
    if (allowed.includes(context)) return { ok: true, value: true }
    return {
      ok: false,
      error: { kind: 'unknown_context', got: context, expected: [...allowed], path, ...metaSlice },
    }
  }
  if (Array.isArray(context) && context.length > 0 && context.every((c) => typeof c === 'string')) {
    const arr = context as string[]
    const inAllow = arr.filter((c) => allowed.includes(c))
    if (inAllow.length === arr.length) return { ok: true, value: true }
    if (inAllow.length === 0) {
      return {
        ok: false,
        error: {
          kind: 'unknown_context',
          got: arr.join(','),
          expected: [...allowed],
          path,
          ...metaSlice,
        },
      }
    }
    return {
      ok: false,
      error: { kind: 'mixed_context', got: arr, allowed: [...allowed], path, ...metaSlice },
    }
  }
  return {
    ok: false,
    error: {
      kind: 'unknown_context',
      got: String(context),
      expected: [...allowed],
      path,
      ...metaSlice,
    },
  }
}
