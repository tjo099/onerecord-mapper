import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { ChangeRequest, JsonLdChangeRequest } from './schema.js'
import { ChangeRequestSchema } from './schema.js'

export function serializeChangeRequest(
  input: ChangeRequest,
  _opts?: SerializeOpts,
): JsonLdChangeRequest {
  const r = ChangeRequestSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeChangeRequest: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdChangeRequest
}

export function serializeChangeRequestStrict(
  input: ChangeRequest,
  _opts?: SerializeOpts,
): ParseResult<JsonLdChangeRequest> {
  const r = ChangeRequestSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdChangeRequest }
}
