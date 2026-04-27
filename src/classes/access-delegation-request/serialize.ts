import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { AccessDelegationRequest, JsonLdAccessDelegationRequest } from './schema.js'
import { AccessDelegationRequestSchema } from './schema.js'

export function serializeAccessDelegationRequest(
  input: AccessDelegationRequest,
  _opts?: SerializeOpts,
): JsonLdAccessDelegationRequest {
  const r = AccessDelegationRequestSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeAccessDelegationRequest: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdAccessDelegationRequest
}

export function serializeAccessDelegationRequestStrict(
  input: AccessDelegationRequest,
  _opts?: SerializeOpts,
): ParseResult<JsonLdAccessDelegationRequest> {
  const r = AccessDelegationRequestSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdAccessDelegationRequest }
}
