import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { JsonLdSecurityDeclaration, SecurityDeclaration } from './schema.js'
import { SecurityDeclarationSchema } from './schema.js'

export function serializeSecurityDeclaration(
  input: SecurityDeclaration,
  _opts?: SerializeOpts,
): JsonLdSecurityDeclaration {
  const r = SecurityDeclarationSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeSecurityDeclaration: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdSecurityDeclaration
}

export function serializeSecurityDeclarationStrict(
  input: SecurityDeclaration,
  _opts?: SerializeOpts,
): ParseResult<JsonLdSecurityDeclaration> {
  const r = SecurityDeclarationSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdSecurityDeclaration }
}
