import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
// src/classes/booking-request/serialize.ts
import type { BookingRequest, JsonLdBookingRequest } from './schema.js'
import { BookingRequestSchema } from './schema.js'

export function serializeBookingRequest(
  input: BookingRequest,
  _opts?: SerializeOpts,
): JsonLdBookingRequest {
  const r = BookingRequestSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'serializeBookingRequest: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdBookingRequest
}

export function serializeBookingRequestStrict(
  input: BookingRequest,
  _opts?: SerializeOpts,
): ParseResult<JsonLdBookingRequest> {
  const r = BookingRequestSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdBookingRequest }
}
