import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { HandlingService, JsonLdHandlingService } from './schema.js'
import { HandlingServiceSchema } from './schema.js'

export function serializeHandlingService(
  input: HandlingService,
  _opts?: SerializeOpts,
): JsonLdHandlingService {
  const r = HandlingServiceSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeHandlingService: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdHandlingService
}

export function serializeHandlingServiceStrict(
  input: HandlingService,
  _opts?: SerializeOpts,
): ParseResult<JsonLdHandlingService> {
  const r = HandlingServiceSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdHandlingService }
}
