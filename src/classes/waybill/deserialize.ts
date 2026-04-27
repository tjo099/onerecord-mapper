import { assertContextAllowed } from '../../context.js'
import { findInvalidIriInIssues } from '../../iri/zod-safe-iri.js'
import type { ParseError, ParseResult } from '../../result.js'
import type { DeserializeOpts } from '../../safety/limits.js'
import { preValidate } from '../../safety/pre-validate.js'
import type { Waybill } from './schema.js'
import { WaybillSchema } from './schema.js'

function withMeta<E extends ParseError>(e: E, meta?: Record<string, unknown>): E {
  return meta ? ({ ...e, meta } as E) : e
}

/** v2 (A1-M5, A3-M4): null-prototype clone on output graph. */
function nullProtoClone(v: unknown): unknown {
  if (v === null || typeof v !== 'object') return v
  if (Array.isArray(v)) return v.map(nullProtoClone)
  const out = Object.create(null) as Record<string, unknown>
  for (const k of Object.getOwnPropertyNames(v)) {
    out[k] = nullProtoClone((v as Record<string, unknown>)[k])
  }
  return out
}

/**
 * v2 (A1-m8/m9): recursively reject empty arrays at any depth.
 *
 * v3 plan correction (authorized 2026-04-27): runs on raw `pre.value`
 * BEFORE Zod parsing — was post-Zod in the v3 plan template, but that
 * order leaves `cardinality_violation` unreachable when a single-IRI
 * field receives `[]` (Zod emits zod_validation first). Pre-Zod
 * placement makes the harness `emptyArrayField` assertion pass for
 * fields of any declared schema type, matching the spec intent
 * ("reject empty arrays on the wire as cardinality_violation").
 */
function findFirstEmptyArray(v: unknown, path: string): { field: string; path: string } | null {
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

export function deserializeWaybill(
  input: unknown,
  opts: DeserializeOpts = {},
): ParseResult<Waybill> {
  // 1. Pre-Zod sanity (depth/nodes/string/array/payload/pollution/cycle)
  const preOpts: Parameters<typeof preValidate>[1] = {}
  if (opts.limits !== undefined) preOpts.limits = opts.limits
  if (opts.payloadByteLength !== undefined) preOpts.payloadByteLength = opts.payloadByteLength
  if (opts.meta !== undefined) preOpts.meta = opts.meta
  const pre = preValidate(input, preOpts)
  if (!pre.ok) return pre

  // 2. v2 (A3-B2, A1-M4): @context allowlist enforced before Zod
  if (pre.value && typeof pre.value === 'object' && '@context' in pre.value) {
    const ctxOpts: Parameters<typeof assertContextAllowed>[1] = {}
    if (opts.allowedContexts !== undefined) ctxOpts.allowedContexts = opts.allowedContexts
    if (opts.meta !== undefined) ctxOpts.meta = opts.meta
    const ctxR = assertContextAllowed((pre.value as Record<string, unknown>)['@context'], ctxOpts)
    if (!ctxR.ok) return ctxR
  }

  // 3. v3 plan correction: empty-array rejection BEFORE Zod (see findFirstEmptyArray jsdoc)
  const empty = findFirstEmptyArray(pre.value, '$')
  if (empty) {
    return {
      ok: false,
      error: withMeta(
        {
          kind: 'cardinality_violation',
          field: empty.field,
          expected: '>=1 or omit',
          got: 0,
          path: empty.path,
        },
        opts.meta,
      ),
    }
  }

  // 4. Zod parse
  const r = WaybillSchema.safeParse(pre.value)
  if (!r.success) {
    // v3 (A1-R2-B1): walk Zod issues for safeIri-tagged ones FIRST.
    // If found, surface as kind: 'invalid_iri' so consumers + T48a get the
    // precise discriminator, not a generic 'zod_validation' envelope.
    const iriErr = findInvalidIriInIssues(r.error.issues, '$')
    if (iriErr) return { ok: false, error: withMeta(iriErr, opts.meta) }
    return {
      ok: false,
      error: withMeta(
        {
          kind: 'zod_validation',
          issues: r.error.issues.map((i) => ({
            path: i.path.length === 0 ? '$' : i.path.join('.'),
            message: i.message,
            code: i.code,
          })),
        },
        opts.meta,
      ),
    }
  }

  // 5. v2 (A1-M5, A3-M4): null-prototype clone the output graph
  return { ok: true, value: nullProtoClone(r.data) as Waybill }
}
