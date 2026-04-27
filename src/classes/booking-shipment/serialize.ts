import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
// src/classes/booking-shipment/serialize.ts
import type { BookingShipment, JsonLdBookingShipment } from './schema.js'
import { BookingShipmentSchema } from './schema.js'

export function serializeBookingShipment(
  input: BookingShipment,
  _opts?: SerializeOpts,
): JsonLdBookingShipment {
  const r = BookingShipmentSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'serializeBookingShipment: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdBookingShipment
}

export function serializeBookingShipmentStrict(
  input: BookingShipment,
  _opts?: SerializeOpts,
): ParseResult<JsonLdBookingShipment> {
  const r = BookingShipmentSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdBookingShipment }
}
