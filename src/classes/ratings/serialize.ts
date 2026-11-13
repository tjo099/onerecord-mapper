import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { JsonLdRatings, Ratings } from './schema.js'
import { RatingsSchema } from './schema.js'

export function serializeRatings(input: Ratings, _opts?: SerializeOpts): JsonLdRatings {
  const r = RatingsSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeRatings: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdRatings
}

export function serializeRatingsStrict(
  input: Ratings,
  _opts?: SerializeOpts,
): ParseResult<JsonLdRatings> {
  const r = RatingsSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdRatings }
}
