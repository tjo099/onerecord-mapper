import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { JsonLdOrganization, Organization } from './schema.js'
import { OrganizationSchema } from './schema.js'

export function serializeOrganization(
  input: Organization,
  _opts?: SerializeOpts,
): JsonLdOrganization {
  const r = OrganizationSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeOrganization: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdOrganization
}

export function serializeOrganizationStrict(
  input: Organization,
  _opts?: SerializeOpts,
): ParseResult<JsonLdOrganization> {
  const r = OrganizationSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdOrganization }
}
