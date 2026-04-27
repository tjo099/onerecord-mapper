// src/operations/json-pointer.ts
import type { ParseResult } from '../result.js'
import { validatePathSegments } from '../safety/path-traversal.js'

declare const JsonPointerBrand: unique symbol
export type JsonPointer = string & { readonly [JsonPointerBrand]: true }

/**
 * Parse a JSON-pointer string per RFC 6901. Empty pointer "" means "the
 * whole document"; non-empty pointers must start with "/". Each segment is
 * validated by `validatePathSegments` (rejects __proto__/constructor/prototype
 * + other prototype-pollution vectors).
 */
export function asJsonPointer(s: string): ParseResult<JsonPointer> {
  if (s !== '' && !s.startsWith('/')) {
    return {
      ok: false,
      error: { kind: 'invalid_pointer', pointer: s, reason: 'empty', path: '$' },
    }
  }
  const r = validatePathSegments(s)
  if (!r.ok) return r as ParseResult<never>
  return { ok: true, value: s as JsonPointer }
}

/**
 * Split a JSON-pointer string into segments. RFC 6901 escape rules:
 *   ~0 -> ~  (must be decoded second)
 *   ~1 -> /  (must be decoded first)
 */
export function splitPointer(p: JsonPointer): readonly string[] {
  if (p === '') return []
  const raw = p.slice(1)
  return raw.split('/').map((seg) => seg.replace(/~1/g, '/').replace(/~0/g, '~'))
}
