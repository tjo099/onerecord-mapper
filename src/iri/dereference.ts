/**
 * Per spec §3.2, IRIs in OneRecord SHOULD be dereferenceable. v0.1.x
 * and v0.2.0 default deserializers validate IRI scheme/host/syntax via
 * `safeIri` but do not check actual reachability — that would force
 * every deserialize call to do network I/O.
 *
 * Closes deviation #7 (v0.2.0 — deferral I) as an opt-in helper
 * consumers can call from their application layer when they need
 * dereferenceability assurance. The library itself stays sync + offline
 * by default.
 *
 * Usage:
 *
 *   import { dereferenceIri } from '@flaks/onerecord'
 *   const r = await dereferenceIri('https://example.com/wb/123')
 *   if (!r.reachable) { ... handle ... }
 *
 * The helper does an `HEAD` request first (cheap), falling back to
 * `GET` if the server doesn't support HEAD. Honors `AbortSignal` for
 * cancellation/timeout. Returns a structured result rather than
 * throwing — error paths (DNS fail, TLS fail, 404, timeout) all
 * surface via `reachable: false`.
 */

export interface DereferenceIriOpts {
  /** AbortSignal for cancellation. Defaults to a 5 s timeout. */
  signal?: AbortSignal
  /** Optional auth header (e.g. `Bearer <jwt>`) for protected resources. */
  authHeader?: string
  /** Custom fetch implementation (defaults to global fetch). */
  fetcher?: typeof fetch
}

export interface DereferenceIriResult {
  reachable: boolean
  /** HTTP status code if a response was received. */
  status?: number
  /** Reason for non-reachability when `reachable` is false. */
  reason?: 'invalid_url' | 'disallowed_scheme' | 'network_error' | 'timeout' | 'http_error'
  /** Error message captured from the underlying fetch. */
  message?: string
}

const DEFAULT_TIMEOUT_MS = 5_000

export async function dereferenceIri(
  iri: string,
  opts: DereferenceIriOpts = {},
): Promise<DereferenceIriResult> {
  // Pre-flight: only http(s) is dereferenceable.
  let url: URL
  try {
    url = new URL(iri)
  } catch (_e) {
    return { reachable: false, reason: 'invalid_url' }
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { reachable: false, reason: 'disallowed_scheme' }
  }

  const fetcher = opts.fetcher ?? fetch
  const signal = opts.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
  const headers: Record<string, string> = { Accept: 'application/ld+json' }
  if (opts.authHeader) headers.Authorization = opts.authHeader

  // Try HEAD first — cheaper for the server.
  try {
    const headRes = await fetcher(iri, { method: 'HEAD', headers, signal })
    if (headRes.ok) return { reachable: true, status: headRes.status }
    // 405 Method Not Allowed → fall back to GET below.
    if (headRes.status !== 405) {
      return { reachable: false, status: headRes.status, reason: 'http_error' }
    }
  } catch (e) {
    if (e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
      return { reachable: false, reason: 'timeout', message: e.message }
    }
    // Don't fail yet on a HEAD network error — fall through to GET.
  }

  try {
    const getRes = await fetcher(iri, { method: 'GET', headers, signal })
    if (getRes.ok) return { reachable: true, status: getRes.status }
    return { reachable: false, status: getRes.status, reason: 'http_error' }
  } catch (e) {
    if (e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')) {
      return { reachable: false, reason: 'timeout', message: e.message }
    }
    return {
      reachable: false,
      reason: 'network_error',
      message: e instanceof Error ? e.message : String(e),
    }
  }
}
