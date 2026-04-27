import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
// src/classes/booking-option-request/serialize.ts
import type { BookingOptionRequest, JsonLdBookingOptionRequest } from './schema.js'
import { BookingOptionRequestSchema } from './schema.js'

export function serializeBookingOptionRequest(
  input: BookingOptionRequest,
  _opts?: SerializeOpts,
): JsonLdBookingOptionRequest {
  const r = BookingOptionRequestSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'serializeBookingOptionRequest: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdBookingOptionRequest
}

export function serializeBookingOptionRequestStrict(
  input: BookingOptionRequest,
  _opts?: SerializeOpts,
): ParseResult<JsonLdBookingOptionRequest> {
  const r = BookingOptionRequestSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdBookingOptionRequest }
}
