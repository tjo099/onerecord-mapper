import { omitEmpty } from '../../../../../src/classes/shared/parse-utils.js'
// FROZEN ORACLE: verbatim `git show v0.5.0:src/classes/booking-option/serialize.ts`; only relative imports to unchanged shared modules were repointed to src/. Do not edit.
import type { ParseResult } from '../../../../../src/result.js'
import { SerializationError } from '../../../../../src/result.js'
import type { SerializeOpts } from '../../../../../src/safety/limits.js'
// src/classes/booking-option/serialize.ts
import type { BookingOption, JsonLdBookingOption } from './schema.js'
import { BookingOptionSchema } from './schema.js'

export function serializeBookingOption(
  input: BookingOption,
  _opts?: SerializeOpts,
): JsonLdBookingOption {
  const r = BookingOptionSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'serializeBookingOption: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdBookingOption
}

export function serializeBookingOptionStrict(
  input: BookingOption,
  _opts?: SerializeOpts,
): ParseResult<JsonLdBookingOption> {
  const r = BookingOptionSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdBookingOption }
}
