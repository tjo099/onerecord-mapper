import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { JsonLdLogisticsEvent, LogisticsEvent } from './schema.js'
import { LogisticsEventSchema } from './schema.js'

export function serializeLogisticsEvent(
  input: LogisticsEvent,
  _opts?: SerializeOpts,
): JsonLdLogisticsEvent {
  const r = LogisticsEventSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeLogisticsEvent: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdLogisticsEvent
}

export function serializeLogisticsEventStrict(
  input: LogisticsEvent,
  _opts?: SerializeOpts,
): ParseResult<JsonLdLogisticsEvent> {
  const r = LogisticsEventSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdLogisticsEvent }
}
