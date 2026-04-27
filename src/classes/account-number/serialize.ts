import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { AccountNumber, JsonLdAccountNumber } from './schema.js'
import { AccountNumberSchema } from './schema.js'

export function serializeAccountNumber(
  input: AccountNumber,
  _opts?: SerializeOpts,
): JsonLdAccountNumber {
  const r = AccountNumberSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeAccountNumber: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdAccountNumber
}

export function serializeAccountNumberStrict(
  input: AccountNumber,
  _opts?: SerializeOpts,
): ParseResult<JsonLdAccountNumber> {
  const r = AccountNumberSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdAccountNumber }
}
