import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { Company, JsonLdCompany } from './schema.js'
import { CompanySchema } from './schema.js'

export function serializeCompany(input: Company, _opts?: SerializeOpts): JsonLdCompany {
  const r = CompanySchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeCompany: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdCompany
}

export function serializeCompanyStrict(
  input: Company,
  _opts?: SerializeOpts,
): ParseResult<JsonLdCompany> {
  const r = CompanySchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdCompany }
}
