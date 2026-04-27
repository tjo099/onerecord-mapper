import type { ParseResult } from '../../result.js'
import { SerializationError } from '../../result.js'
import type { SerializeOpts } from '../../safety/limits.js'
import { omitEmpty } from '../shared/parse-utils.js'
import type { JsonLdSubscription, Subscription } from './schema.js'
import { SubscriptionSchema } from './schema.js'

export function serializeSubscription(
  input: Subscription,
  _opts?: SerializeOpts,
): JsonLdSubscription {
  const r = SubscriptionSchema.safeParse(input)
  if (!r.success) {
    throw new SerializationError(
      'invalid_application_object',
      'SerializationError[invalid_application_object]: serializeSubscription: invalid input',
      r.error.issues,
    )
  }
  return omitEmpty(r.data) as unknown as JsonLdSubscription
}

export function serializeSubscriptionStrict(
  input: Subscription,
  _opts?: SerializeOpts,
): ParseResult<JsonLdSubscription> {
  const r = SubscriptionSchema.safeParse(input)
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
  return { ok: true, value: omitEmpty(r.data) as unknown as JsonLdSubscription }
}
