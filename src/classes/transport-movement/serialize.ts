import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { JsonLdTransportMovement, TransportMovement } from './schema.js'
import { TransportMovementSchema } from './schema.js'

export function serializeTransportMovement(
  input: TransportMovement,
  _opts?: SerializeOpts,
): JsonLdTransportMovement {
  const r = TransportMovementSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeTransportMovement: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdTransportMovement
}

export function serializeTransportMovementStrict(
  input: TransportMovement,
  _opts?: SerializeOpts,
): ParseResult<JsonLdTransportMovement> {
  const r = TransportMovementSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdTransportMovement }
}
