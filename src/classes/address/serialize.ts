import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { Address, JsonLdAddress } from './schema.js'
import { AddressSchema } from './schema.js'

export function serializeAddress(input: Address, _opts?: SerializeOpts): JsonLdAddress {
  const r = AddressSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeAddress: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdAddress
}

export function serializeAddressStrict(
  input: Address,
  _opts?: SerializeOpts,
): ParseResult<JsonLdAddress> {
  const r = AddressSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdAddress }
}
