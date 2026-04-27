// src/error/redact.ts
import type { ParseError, PublicParseError } from '../result.js'

/**
 * Strips all diagnostic fields except `kind` and (when present) `path`.
 * Safe to return in public API responses — no internal details leaked.
 */
export function redactError(e: ParseError): PublicParseError {
  // Only `kind` and `path` (when present) are exposed publicly.
  if ('path' in e && typeof e.path === 'string') {
    return { kind: e.kind, path: e.path }
  }
  return { kind: e.kind }
}
