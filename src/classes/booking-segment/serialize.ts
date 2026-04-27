import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
// src/classes/booking-segment/serialize.ts
import type { BookingSegment, JsonLdBookingSegment } from './schema.js'
import { BookingSegmentSchema } from './schema.js'

export function serializeBookingSegment(
  input: BookingSegment,
  _opts?: SerializeOpts,
): JsonLdBookingSegment {
  const r = BookingSegmentSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'serializeBookingSegment: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdBookingSegment
}

export function serializeBookingSegmentStrict(
  input: BookingSegment,
  _opts?: SerializeOpts,
): ParseResult<JsonLdBookingSegment> {
  const r = BookingSegmentSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdBookingSegment }
}
