import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { JsonLdShipment, Shipment } from './schema.js'
import { ShipmentSchema } from './schema.js'

export function serializeShipment(input: Shipment, _opts?: SerializeOpts): JsonLdShipment {
  const r = ShipmentSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeShipment: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdShipment
}

export function serializeShipmentStrict(
  input: Shipment,
  _opts?: SerializeOpts,
): ParseResult<JsonLdShipment> {
  const r = ShipmentSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdShipment }
}
