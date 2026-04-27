import { assertContextAllowed } from '../../context.js'
import { findInvalidIriInIssues } from '../../iri/zod-safe-iri.js'
import type { ParseResult } from '../../result.js'
import type { DeserializeOpts } from '../../safety/limits.js'
import { preValidate } from '../../safety/pre-validate.js'
import { findFirstEmptyArray, nullProtoClone, withMeta } from '../shared/parse-utils.js'
import type { Notification } from './schema.js'
import { NotificationSchema } from './schema.js'

export function deserializeNotification(
  input: unknown,
  opts: DeserializeOpts = {},
): ParseResult<Notification> {
  // 1. Pre-Zod sanity (depth/nodes/string/array/payload/pollution/cycle)
  const preOpts: Parameters<typeof preValidate>[1] = {}
  if (opts.limits !== undefined) preOpts.limits = opts.limits
  if (opts.payloadByteLength !== undefined) preOpts.payloadByteLength = opts.payloadByteLength
  if (opts.meta !== undefined) preOpts.meta = opts.meta
  const pre = preValidate(input, preOpts)
  if (!pre.ok) return pre

  // 2. v2 (A3-B2, A1-M4): @context allowlist enforced before Zod
  if (pre.value && typeof pre.value === 'object' && '@context' in pre.value) {
    const ctxOpts: Parameters<typeof assertContextAllowed>[1] = {}
    if (opts.allowedContexts !== undefined) ctxOpts.allowedContexts = opts.allowedContexts
    if (opts.meta !== undefined) ctxOpts.meta = opts.meta
    const ctxR = assertContextAllowed((pre.value as Record<string, unknown>)['@context'], ctxOpts)
    if (!ctxR.ok) return ctxR
  }

  // 3. v3 plan correction: empty-array rejection BEFORE Zod
  const empty = findFirstEmptyArray(pre.value, '$')
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

  // 4. Zod parse — lift safeIri-tagged issues to invalid_iri
  const r = NotificationSchema.safeParse(pre.value)
  if (!r.success) {
    const iriErr = findInvalidIriInIssues(r.error.issues, '$')
    if (iriErr) return { ok: false, error: withMeta(iriErr, opts.meta) }
    return {
      ok: false,
      error: withMeta(
        {
          kind: 'zod_validation',
          issues: r.error.issues.map((i) => ({
            path: i.path.length === 0 ? '$' : i.path.join('.'),
            message: i.message,
            code: i.code,
          })),
        },
        opts.meta,
      ),
    }
  }

  // 5. v2 (A1-M5, A3-M4): null-prototype clone the output graph
  return { ok: true, value: nullProtoClone(r.data) as Notification }
}
