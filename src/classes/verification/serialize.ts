import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { JsonLdVerification, Verification } from './schema.js'
import { VerificationSchema } from './schema.js'

export function serializeVerification(
  input: Verification,
  _opts?: SerializeOpts,
): JsonLdVerification {
  const r = VerificationSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeVerification: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdVerification
}

export function serializeVerificationStrict(
  input: Verification,
  _opts?: SerializeOpts,
): ParseResult<JsonLdVerification> {
  const r = VerificationSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdVerification }
}
