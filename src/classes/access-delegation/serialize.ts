import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { AccessDelegation, JsonLdAccessDelegation } from './schema.js'
import { AccessDelegationSchema } from './schema.js'

export function serializeAccessDelegation(
  input: AccessDelegation,
  _opts?: SerializeOpts,
): JsonLdAccessDelegation {
  const r = AccessDelegationSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeAccessDelegation: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdAccessDelegation
}

export function serializeAccessDelegationStrict(
  input: AccessDelegation,
  _opts?: SerializeOpts,
): ParseResult<JsonLdAccessDelegation> {
  const r = AccessDelegationSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdAccessDelegation }
}
