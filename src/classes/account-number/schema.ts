import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const AccountNumberSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('AccountNumber'),
  accountNumber: z.string().max(35),
  issuedBy: safeIri().optional(),
  accountType: z.enum(['IATA_CASS', 'INTERNAL', 'OTHER']).optional(),
}).strict()

export type AccountNumber = z.infer<typeof AccountNumberSchema>
export type JsonLdAccountNumber = JsonLd<'AccountNumber'>
