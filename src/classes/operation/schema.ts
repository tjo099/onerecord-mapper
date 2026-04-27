import { z } from 'zod'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

/**
 * v3 (A2-R2-M2): explicit Operation schema. Used by Change.hasOperation
 * AND by applyChange (via OperationLike structural type — see T50). The
 * operation-roundtrip integration test (T50 Step 4) depends on this exact
 * shape being executable; v2's "unchanged from v1" prose left this dead.
 *
 * `op` is the PatchOperation enum: ADD or DELETE.
 * `path` is a JSON-pointer string (RFC 6901). Brand-validation happens at
 * applyChange call time, not in this schema (Operation may be parsed from
 * an external system whose pointers we have not yet validated).
 * `value` is structurally `unknown`; applyChange's schema re-validate
 * step (after applying the op) catches type mismatches against the target codec.
 */
export const OperationSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Operation'),
  op: z.enum(['ADD', 'DELETE']),
  path: z.string().min(1).regex(/^\//, 'must start with /'),
  value: z.unknown().optional(),
}).strict()

export type Operation = z.infer<typeof OperationSchema>
export type JsonLdOperation = JsonLd<'Operation'>
