import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
// src/classes/booking/serialize.ts
import type { Booking, JsonLdBooking } from './schema.js'
import { BookingSchema } from './schema.js'

export function serializeBooking(input: Booking, _opts?: SerializeOpts): JsonLdBooking {
  const r = BookingSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'serializeBooking: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdBooking
}

export function serializeBookingStrict(
  input: Booking,
  _opts?: SerializeOpts,
): ParseResult<JsonLdBooking> {
  const r = BookingSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdBooking }
}
