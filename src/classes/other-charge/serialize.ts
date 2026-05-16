import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { JsonLdOtherCharge, OtherCharge } from './schema.js'
import { OtherChargeSchema } from './schema.js'

export function serializeOtherCharge(input: OtherCharge, _opts?: SerializeOpts): JsonLdOtherCharge {
  const r = OtherChargeSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeOtherCharge: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdOtherCharge
}

export function serializeOtherChargeStrict(
  input: OtherCharge,
  _opts?: SerializeOpts,
): ParseResult<JsonLdOtherCharge> {
  const r = OtherChargeSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdOtherCharge }
}
