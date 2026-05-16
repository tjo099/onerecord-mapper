import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { Insurance, JsonLdInsurance } from './schema.js'
import { InsuranceSchema } from './schema.js'

export function serializeInsurance(input: Insurance, _opts?: SerializeOpts): JsonLdInsurance {
  const r = InsuranceSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeInsurance: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdInsurance
}

export function serializeInsuranceStrict(
  input: Insurance,
  _opts?: SerializeOpts,
): ParseResult<JsonLdInsurance> {
  const r = InsuranceSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdInsurance }
}
