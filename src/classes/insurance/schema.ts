import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'
import { CurrencyValueSchema } from '../shared/value.js'

export const InsuranceSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Insurance'),
  insuredAmount: CurrencyValueSchema.optional(),
  coveringOrganization: safeIri().optional(),
  insuredShipments: z.array(safeIri()).optional(),
}).strict()

export type Insurance = z.infer<typeof InsuranceSchema>
export type JsonLdInsurance = JsonLd<'Insurance'>
