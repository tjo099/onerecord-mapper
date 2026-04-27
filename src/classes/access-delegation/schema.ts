import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const AccessDelegationSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('AccessDelegation'),
  delegatedTo: safeIri(),
  delegatedFrom: safeIri(),
  permissions: z.array(z.enum(['READ', 'WRITE', 'AUDIT'])),
  validFrom: z.string().datetime({ offset: true }).optional(),
  validUntil: z.string().datetime({ offset: true }).optional(),
}).strict()

export type AccessDelegation = z.infer<typeof AccessDelegationSchema>
export type JsonLdAccessDelegation = JsonLd<'AccessDelegation'>
