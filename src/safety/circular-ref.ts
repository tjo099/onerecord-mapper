import type { ParseResult } from '../result.js'

/**
 * JS-level cycle detection per spec §13. JSON-LD `@id` back-references are
 * VALID graph navigation and are NOT flagged here — that distinction matters
 * because OneRecord graphs are highly cross-referential.
 */
export function detectCycle(input: unknown): ParseResult<true> {
  const seen = new WeakSet<object>()
  const path: string[] = []

  function walk(v: unknown, segment: string): ParseResult<true> {
    if (v === null || typeof v !== 'object') return { ok: true, value: true }
    if (seen.has(v as object)) {
      return { ok: false, error: { kind: 'circular_reference', cyclePath: [...path, segment] } }
    }
    seen.add(v as object)
    path.push(segment)
    if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i++) {
        const r = walk(v[i], `[${i}]`)
        if (!r.ok) return r
      }
    } else {
      for (const k of Object.getOwnPropertyNames(v)) {
        const r = walk((v as Record<string, unknown>)[k], `.${k}`)
        if (!r.ok) return r
      }
    }
    path.pop()
    seen.delete(v as object)
    return { ok: true, value: true }
  }

  return walk(input, '$')
}
