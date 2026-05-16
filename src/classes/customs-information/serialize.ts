import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { CustomsInformation, JsonLdCustomsInformation } from './schema.js'
import { CustomsInformationSchema } from './schema.js'

export function serializeCustomsInformation(
  input: CustomsInformation,
  _opts?: SerializeOpts,
): JsonLdCustomsInformation {
  const r = CustomsInformationSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeCustomsInformation: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdCustomsInformation
}

export function serializeCustomsInformationStrict(
  input: CustomsInformation,
  _opts?: SerializeOpts,
): ParseResult<JsonLdCustomsInformation> {
  const r = CustomsInformationSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdCustomsInformation }
}
