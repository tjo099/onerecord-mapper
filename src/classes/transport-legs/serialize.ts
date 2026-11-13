import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { JsonLdTransportLegs, TransportLegs } from './schema.js'
import { TransportLegsSchema } from './schema.js'

export function serializeTransportLegs(
  input: TransportLegs,
  _opts?: SerializeOpts,
): JsonLdTransportLegs {
  const r = TransportLegsSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeTransportLegs: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdTransportLegs
}

export function serializeTransportLegsStrict(
  input: TransportLegs,
  _opts?: SerializeOpts,
): ParseResult<JsonLdTransportLegs> {
  const r = TransportLegsSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdTransportLegs }
}
