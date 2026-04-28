/**
 * Per RFC 3987 + spec §3.2 the canonical IRI form requires:
 *  - scheme in lowercase (`https` not `HTTPS`)
 *  - host in lowercase (`example.com` not `EXAMPLE.COM`)
 *  - no default port (omit `:443` for https, `:80` for http)
 *
 * Percent-encoding case (uppercase hex) is intentionally NOT checked
 * here — modern URL parsers already normalize it, and the false-positive
 * surface in v0.2 is too high.
 *
 * Used by `dispatchGraphWalk` to emit `iri_not_canonical` for non-canonical
 * IRIs anywhere in the graph. Default deserializers (v0.1.x compat) do
 * NOT run this check; it's only fired through the opt-in dispatch path.
 */

/** True if `s` looks like an IRI (has a `scheme:` prefix). */
export function looksLikeIri(s: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9+.\-]*:/.test(s)
}

export type IriCanonicalReason = 'scheme_not_lowercase' | 'host_not_lowercase' | 'default_port'

export interface IriCanonicalResult {
  canonical: boolean
  reason?: IriCanonicalReason
}

/**
 * Check whether `s` is in canonical form per RFC 3987 + spec §3.2.
 * Non-IRI strings (no scheme prefix) return `{ canonical: true }` —
 * other validators (Zod schemas, safeIri) handle the malformed case.
 */
export function checkIriCanonical(s: string): IriCanonicalResult {
  // 1. Scheme must be lowercase.
  const schemeMatch = s.match(/^([a-zA-Z][a-zA-Z0-9+.\-]*):/)
  if (!schemeMatch) return { canonical: true } // not IRI-shaped
  const scheme = schemeMatch[1] as string
  if (scheme !== scheme.toLowerCase()) {
    return { canonical: false, reason: 'scheme_not_lowercase' }
  }

  // 2. Host must be lowercase. Only applies to schemes with `://` authority.
  const authMatch = s.match(/^[a-zA-Z][a-zA-Z0-9+.\-]*:\/\/([^/?#]+)/)
  if (authMatch) {
    const authority = authMatch[1] as string // may include user@ and :port
    // Strip optional userinfo (`user@`) before comparison; userinfo case
    // is application-defined.
    const hostAndPort = authority.includes('@')
      ? authority.slice(authority.indexOf('@') + 1)
      : authority
    if (hostAndPort !== hostAndPort.toLowerCase()) {
      return { canonical: false, reason: 'host_not_lowercase' }
    }
    // 3. Default-port check (only when port is explicitly present).
    if (scheme === 'https' && /:443([/?#]|$)/.test(s)) {
      return { canonical: false, reason: 'default_port' }
    }
    if (scheme === 'http' && /:80([/?#]|$)/.test(s)) {
      return { canonical: false, reason: 'default_port' }
    }
  }

  return { canonical: true }
}
