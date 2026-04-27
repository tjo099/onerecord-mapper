import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { JsonLdVerificationRequest, VerificationRequest } from './schema.js'
import { VerificationRequestSchema } from './schema.js'

export function serializeVerificationRequest(
  input: VerificationRequest,
  _opts?: SerializeOpts,
): JsonLdVerificationRequest {
  const r = VerificationRequestSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeVerificationRequest: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdVerificationRequest
}

export function serializeVerificationRequestStrict(
  input: VerificationRequest,
  _opts?: SerializeOpts,
): ParseResult<JsonLdVerificationRequest> {
  const r = VerificationRequestSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdVerificationRequest }
}
