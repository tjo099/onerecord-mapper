import type { ParseResult } from '../result.js'

/**
 * Recursively scan an input graph for any `@id` value that uses the
 * JSON-LD blank-node syntax (`_:b0`, `_:n123`, etc.). Per spec §3.2, the
 * canonical OneRecord wire form forbids blank nodes — peers must use
 * stable IRIs.
 *
 * Closes deviation #8 (v0.2.0 — deferral C). v0.1.x silently accepted
 * blank-node `@id` values; they would surface as `zod_validation` later
 * (because they pass `safeIri` syntactic validation but don't resolve to
 * a real IRI). The new `blank_node_forbidden` kind is the right
 * discriminator for this failure.
 *
 * Runs before Zod in the per-class deserialize pipeline; if it returns
 * an error, downstream Zod validation is skipped.
 */
export function scanForBlankNodes(
  input: unknown,
  opts: { meta?: Record<string, unknown> } = {},
): ParseResult<true> {
  const metaSlice = opts.meta ? { meta: opts.meta } : {}

  function isBlankNodeId(v: unknown): v is string {
    // RFC: blank-node identifiers in JSON-LD have the form `_:<label>`
    // where label is one or more characters. A plain `_:` (zero-length
    // label) isn't a valid blank node either; we treat it as forbidden too.
    return typeof v === 'string' && v.startsWith('_:')
  }

  function walk(v: unknown, path: string): ParseResult<true> {
    if (v === null || typeof v !== 'object') return { ok: true, value: true }
    if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i++) {
        const r = walk(v[i], `${path}[${i}]`)
        if (!r.ok) return r
      }
      return { ok: true, value: true }
    }
    const obj = v as Record<string, unknown>
    const id = obj['@id']
    if (isBlankNodeId(id)) {
      return {
        ok: false,
        error: {
          kind: 'blank_node_forbidden',
          blankId: id,
          path: `${path}.@id`,
          ...metaSlice,
        },
      }
    }
    for (const k of Object.getOwnPropertyNames(obj)) {
      if (k === '@id' || k === '@type' || k === '@context') continue
      const r = walk(obj[k], `${path}.${k}`)
      if (!r.ok) return r
    }
    return { ok: true, value: true }
  }

  return walk(input, '$')
}
