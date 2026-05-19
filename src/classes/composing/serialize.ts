import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { Composing, JsonLdComposing } from './schema.js'
import { ComposingSchema } from './schema.js'

export function serializeComposing(input: Composing, _opts?: SerializeOpts): JsonLdComposing {
  const r = ComposingSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeComposing: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdComposing
}

export function serializeComposingStrict(
  input: Composing,
  _opts?: SerializeOpts,
): ParseResult<JsonLdComposing> {
  const r = ComposingSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdComposing }
}
