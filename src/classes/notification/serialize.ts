import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { JsonLdNotification, Notification } from './schema.js'
import { NotificationSchema } from './schema.js'

export function serializeNotification(
  input: Notification,
  _opts?: SerializeOpts,
): JsonLdNotification {
  const r = NotificationSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeNotification: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdNotification
}

export function serializeNotificationStrict(
  input: Notification,
  _opts?: SerializeOpts,
): ParseResult<JsonLdNotification> {
  const r = NotificationSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdNotification }
}
