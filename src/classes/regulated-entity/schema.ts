import { z } from 'zod'
import { RegulatedEntityCategoryCode } from '../../codes/enums.js'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const RegulatedEntitySchema = LogisticsObjectSchema.extend({
  '@type': z.literal('RegulatedEntity'),
  owningOrganization: safeIri().optional(),
  regulatedEntityCategory: RegulatedEntityCategoryCode.optional(),
  regulatedEntityIdentifier: z.string().min(1).max(256).optional(),
  regulatedEntityExpiryDate: z.string().datetime().optional(),
}).strict()

export type RegulatedEntity = z.infer<typeof RegulatedEntitySchema>
export type JsonLdRegulatedEntity = JsonLd<'RegulatedEntity'>
