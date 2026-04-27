import type { AssertContextOpts } from '../../context.js'
import type { ParseError } from '../../result.js'
import type { DeserializeOpts } from '../../safety/limits.js'
import type { PreValidateOpts } from '../../safety/pre-validate.js'

/**
 * Attach `meta` to a `ParseError`, preserving the discriminant kind.
 * Per-class deserializers use this in every error-construction site so
 * `opts.meta` (request id, trace id, etc.) propagates uniformly.
 */
export function withMeta<E extends ParseError>(e: E, meta?: Record<string, unknown>): E {
  return meta ? ({ ...e, meta } as E) : e
}

/** Build PreValidateOpts from DeserializeOpts without undefined properties (exactOptionalPropertyTypes). */
export function toPreValidateOpts(opts: DeserializeOpts): PreValidateOpts {
  const o: PreValidateOpts = {}
  if (opts.limits !== undefined) o.limits = opts.limits
  if (opts.payloadByteLength !== undefined) o.payloadByteLength = opts.payloadByteLength
  if (opts.meta !== undefined) o.meta = opts.meta
  return o
}

/** Build AssertContextOpts from DeserializeOpts without undefined properties (exactOptionalPropertyTypes). */
export function toContextOpts(opts: DeserializeOpts): AssertContextOpts {
  const o: AssertContextOpts = {}
  if (opts.allowedContexts !== undefined) o.allowedContexts = opts.allowedContexts
  if (opts.meta !== undefined) o.meta = opts.meta
  return o
}

/**
 * Recursively clone an object/array graph onto null-prototype objects.
 * v2 (A1-M5, A3-M4): the deserializer applies this to its output so consumers
 * never see Object.prototype on the result graph (honours spec §6.5.2 step 5).
 *
 * Strings/numbers/booleans/null/undefined pass through unchanged.
 */
export function nullProtoClone(v: unknown): unknown {
  if (v === null || typeof v !== 'object') return v
  if (Array.isArray(v)) return v.map(nullProtoClone)
  const out = Object.create(null) as Record<string, unknown>
  for (const k of Object.getOwnPropertyNames(v)) {
    out[k] = nullProtoClone((v as Record<string, unknown>)[k])
  }
  return out
}

/**
 * Walk an object/array graph and return the path of the first empty array
 * encountered. Used by per-class deserializers to reject empty arrays at any
 * depth as `cardinality_violation`.
 *
 * v3 plan correction (Task 25): runs on raw input BEFORE Zod, so the
 * `cardinality_violation` discriminant is reachable for fields whose schema
 * declares them as single values (the harness `emptyArrayField` assertion).
 */
export function findFirstEmptyArray(
  v: unknown,
  path: string,
): { field: string; path: string } | null {
  if (Array.isArray(v)) {
    if (v.length === 0) return { field: path.split('.').pop() ?? path, path }
    for (let i = 0; i < v.length; i++) {
      const r = findFirstEmptyArray(v[i], `${path}[${i}]`)
      if (r) return r
    }
    return null
  }
  if (v && typeof v === 'object') {
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      const r = findFirstEmptyArray(val, `${path}.${k}`)
      if (r) return r
    }
  }
  return null
}

/**
 * Recursive walk that strips empty arrays at every level. Per-class
 * serializers apply this after Zod validation to ensure wire output never
 * carries `[]` (round-trip equivalent to omitted field per spec §7.1).
 *
 * Returns `undefined` for empty arrays so callers can drop the slot entirely.
 * `undefined`-valued slots in objects are also dropped. Other primitives
 * pass through unchanged.
 */
export function omitEmpty(v: unknown): unknown {
  if (Array.isArray(v)) {
    if (v.length === 0) return undefined
    return v.map(omitEmpty).filter((x) => x !== undefined)
  }
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      const cleaned = omitEmpty(val)
      if (cleaned === undefined) continue
      if (Array.isArray(cleaned) && cleaned.length === 0) continue
      out[k] = cleaned
    }
    return out
  }
  return v
}
