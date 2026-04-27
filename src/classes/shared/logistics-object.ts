// src/classes/shared/logistics-object.ts
import { z } from 'zod'

/**
 * Abstract supertype for every cargo / api class. The compact-form
 * JSON-LD envelope: @context (string OR array — loose), @type (string),
 * @id (string).
 *
 * v2 (A1-M4): schema is intentionally loose on @context — the
 * assertContextAllowed helper (Task 11) does the allowlist enforcement
 * in per-class deserialize.ts before Zod runs.
 *
 * v2 (A1-M7): .strict() so unknown wire keys raise zod_validation
 * (forward-compat detection), not silent strip. Per-class .extend()
 * inherits this.
 *
 * Per-class schemas extend this with `.extend({ ... })`.
 */
export const LogisticsObjectSchema = z
  .object({
    '@context': z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
    '@type': z.string().min(1),
    '@id': z.string().min(1),
  })
  .strict()

export type LogisticsObject = z.infer<typeof LogisticsObjectSchema>
