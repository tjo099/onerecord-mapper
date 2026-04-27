// src/iri/normalize.ts
import type { SafeIri } from './strategy.js'

/**
 * Normalize an IRI for equality comparison.
 *
 * - HTTP/HTTPS: parse via `new URL()` and use `.href` (handles trailing-slash,
 *   percent-encoding case, scheme normalization, default-port stripping).
 * - Non-HTTP IRIs (urn:, custom schemes): Unicode NFC normalize and exact-match.
 *
 * `new URL()` rejects non-HTTP — that fallback is documented and required.
 */
export function normalizeIri(iri: string): string {
  try {
    const u = new URL(iri)
    if (u.protocol === 'https:' || u.protocol === 'http:') {
      return u.href
    }
  } catch {
    // fall through
  }
  return iri.normalize('NFC')
}

export function iriEquals(a: SafeIri | string, b: SafeIri | string): boolean {
  return normalizeIri(a) === normalizeIri(b)
}
