import { z } from 'zod'
import { OperationSchema } from '../operation/schema.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const ChangeSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Change'),
  /** Required operation list — empty arrays rejected by per-class deserialize */
  hasOperation: z.array(OperationSchema).min(1),
  /** Optional reason text */
  changeReason: z.string().max(2048).optional(),
}).strict()

export type Change = z.infer<typeof ChangeSchema>
export type JsonLdChange = JsonLd<'Change'>
