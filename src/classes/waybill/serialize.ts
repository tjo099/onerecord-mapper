import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import type { JsonLdWaybill, Waybill } from './schema.js'
import { WaybillSchema } from './schema.js'

/**
 * v2 (A1-m8, A1-m9): recursive walk — strip empty arrays at every level,
 * never silently omit `undefined` from required slots (Zod-parsed output
 * elides optional undefined naturally).
 */
function omitEmpty(v: unknown): unknown {
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

export function serializeWaybill(input: Waybill, _opts?: SerializeOpts): JsonLdWaybill {
  const r = WaybillSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeWaybill: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdWaybill
}

export function serializeWaybillStrict(
  input: Waybill,
  _opts?: SerializeOpts,
): ParseResult<JsonLdWaybill> {
  const r = WaybillSchema.safeParse(input)
  if (!r.success) {
    return {
      ok: false,
      error: {
        kind: 'zod_validation',
        issues: r.error.issues.map((i) => ({
          path: i.path.length === 0 ? '$' : i.path.join('.'),
          message: i.message,
          code: i.code,
        })),
      },
    }
  }
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdWaybill }
}
