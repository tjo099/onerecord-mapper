import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { JsonLdWaybillLineItem, WaybillLineItem } from './schema.js'
import { WaybillLineItemSchema } from './schema.js'

export function serializeWaybillLineItem(
  input: WaybillLineItem,
  _opts?: SerializeOpts,
): JsonLdWaybillLineItem {
  const r = WaybillLineItemSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeWaybillLineItem: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdWaybillLineItem
}

export function serializeWaybillLineItemStrict(
  input: WaybillLineItem,
  _opts?: SerializeOpts,
): ParseResult<JsonLdWaybillLineItem> {
  const r = WaybillLineItemSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdWaybillLineItem }
}
