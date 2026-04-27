import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { JsonLdMovementTime, MovementTime } from './schema.js'
import { MovementTimeSchema } from './schema.js'

export function serializeMovementTime(
  input: MovementTime,
  _opts?: SerializeOpts,
): JsonLdMovementTime {
  const r = MovementTimeSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeMovementTime: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdMovementTime
}

export function serializeMovementTimeStrict(
  input: MovementTime,
  _opts?: SerializeOpts,
): ParseResult<JsonLdMovementTime> {
  const r = MovementTimeSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdMovementTime }
}
