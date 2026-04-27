import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const ChangeRequestSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('ChangeRequest'),
  /** IRI of the LogisticsObject this ChangeRequest targets */
  forLogisticsObject: safeIri(),
  /** IRI of the Change document containing the operations */
  hasChange: safeIri(),
  /** Optional ISO datetime the requestor expects ack-by */
  expectedResponseTime: z.string().datetime({ offset: true }).optional(),
  /** Status enum from src/codes/enums.ts (RequestStatus) */
  requestStatus: z.enum([
    'REQUEST_PENDING',
    'REQUEST_ACCEPTED',
    'REQUEST_REJECTED',
    'REQUEST_REVOKED',
  ]),
}).strict()

export type ChangeRequest = z.infer<typeof ChangeRequestSchema>
export type JsonLdChangeRequest = JsonLd<'ChangeRequest'>
