import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
// src/classes/booking-preferences/serialize.ts
import type { BookingPreferences, JsonLdBookingPreferences } from './schema.js'
import { BookingPreferencesSchema } from './schema.js'

export function serializeBookingPreferences(
  input: BookingPreferences,
  _opts?: SerializeOpts,
): JsonLdBookingPreferences {
  const r = BookingPreferencesSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'serializeBookingPreferences: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdBookingPreferences
}

export function serializeBookingPreferencesStrict(
  input: BookingPreferences,
  _opts?: SerializeOpts,
): ParseResult<JsonLdBookingPreferences> {
  const r = BookingPreferencesSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdBookingPreferences }
}
