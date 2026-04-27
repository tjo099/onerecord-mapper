import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
// src/classes/booking-times/serialize.ts
import type { BookingTimes, JsonLdBookingTimes } from './schema.js'
import { BookingTimesSchema } from './schema.js'

export function serializeBookingTimes(
  input: BookingTimes,
  _opts?: SerializeOpts,
): JsonLdBookingTimes {
  const r = BookingTimesSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'serializeBookingTimes: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdBookingTimes
}

export function serializeBookingTimesStrict(
  input: BookingTimes,
  _opts?: SerializeOpts,
): ParseResult<JsonLdBookingTimes> {
  const r = BookingTimesSchema.safeParse(input)
  if (!r.success) {
    return {
      ok: false,
      error: {
        kind: 'zod_validation',
        issues: r.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
          code: i.code,
        })),
      },
    }
  }
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdBookingTimes }
}
