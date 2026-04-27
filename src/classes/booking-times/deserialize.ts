import { assertContextAllowed } from '../../context.js'
import type { ParseResult } from '../../result.js'
import type { DeserializeOpts } from '../../safety/limits.js'
import { preValidate } from '../../safety/pre-validate.js'
import {
  findFirstEmptyArray,
  nullProtoClone,
  toContextOpts,
  toPreValidateOpts,
  withMeta,
} from '../shared/parse-utils.js'
// src/classes/booking-times/deserialize.ts
import type { BookingTimes } from './schema.js'
import { BookingTimesSchema } from './schema.js'

export function deserializeBookingTimes(
  input: unknown,
  opts: DeserializeOpts = {},
): ParseResult<BookingTimes> {
  const pre = preValidate(input, toPreValidateOpts(opts))
  if (!pre.ok) return pre

  if (input && typeof input === 'object' && '@context' in input) {
    const ctxR = assertContextAllowed(
      (input as Record<string, unknown>)['@context'],
      toContextOpts(opts),
    )
    if (!ctxR.ok) return ctxR
  }

  const r = BookingTimesSchema.safeParse(pre.value)
  if (!r.success) {
    return {
      ok: false,
      error: withMeta(
        {
          kind: 'zod_validation',
          issues: r.error.issues.map((i) => ({
            path: i.path.join('.'),
            message: i.message,
            code: i.code,
          })),
        },
        opts.meta,
      ),
    }
  }

  const empty = findFirstEmptyArray(r.data, '$')
  if (empty) {
    return {
      ok: false,
      error: withMeta(
        {
          kind: 'cardinality_violation',
          field: empty.field,
          expected: '>=1 or omit',
          got: 0,
          path: empty.path,
        },
        opts.meta,
      ),
    }
  }

  return { ok: true, value: nullProtoClone(r.data) as BookingTimes }
}
