import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { JsonLdLineItemPackage, LineItemPackage } from './schema.js'
import { LineItemPackageSchema } from './schema.js'

export function serializeLineItemPackage(
  input: LineItemPackage,
  _opts?: SerializeOpts,
): JsonLdLineItemPackage {
  const r = LineItemPackageSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeLineItemPackage: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdLineItemPackage
}

export function serializeLineItemPackageStrict(
  input: LineItemPackage,
  _opts?: SerializeOpts,
): ParseResult<JsonLdLineItemPackage> {
  const r = LineItemPackageSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdLineItemPackage }
}
