import { ALLOWED_CONTEXTS } from '../context.js'

/**
 * Per JSON-LD 1.1 §3.7, when `@context` is an array, later items
 * override earlier ones for term definitions. The OneRecord spec §7.1
 * doesn't pin the array form explicitly, but consumers relying on the
 * default `assertContextAllowed`'s set semantics would silently accept
 * `["https://onerecord.iata.org/ns/cargo", "https://attacker.com/ns"]`
 * — where the later URL could override cargo term definitions.
 *
 * Closes deviation #10 (v0.2.0 — deferral E). Opt-in via dispatch only:
 * default per-class deserializers preserve v0.1.x set semantics for
 * non-breaking compatibility.
 */

export interface ContextOrderResult {
  ok: boolean
  /** When ok is false, the unallowed last element. */
  lastUnallowed?: string
}

/**
 * Check that the LAST element of an array `@context` is in the
 * allowlist (= the "effective" context for term definitions). String-form
 * `@context` is delegated to `assertContextAllowed` (set semantics);
 * this function only fires for array form.
 *
 * Returns `{ ok: true }` for non-arrays or arrays where the last
 * element is allowed.
 */
export function checkContextOrder(
  context: unknown,
  allowedContexts: readonly string[] = ALLOWED_CONTEXTS,
): ContextOrderResult {
  if (!Array.isArray(context) || context.length === 0) return { ok: true }
  const last = context[context.length - 1]
  if (typeof last !== 'string') return { ok: true } // shape error — handled elsewhere
  if (allowedContexts.includes(last)) return { ok: true }
  return { ok: false, lastUnallowed: last }
}
