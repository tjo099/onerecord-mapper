import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { JsonLdWaybill, Waybill } from './schema.js'
import { WaybillSchema } from './schema.js'

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
