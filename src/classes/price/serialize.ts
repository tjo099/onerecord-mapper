import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { JsonLdPrice, Price } from './schema.js'
import { PriceSchema } from './schema.js'

export function serializePrice(input: Price, _opts?: SerializeOpts): JsonLdPrice {
  const r = PriceSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializePrice: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdPrice
}

export function serializePriceStrict(
  input: Price,
  _opts?: SerializeOpts,
): ParseResult<JsonLdPrice> {
  const r = PriceSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdPrice }
}
