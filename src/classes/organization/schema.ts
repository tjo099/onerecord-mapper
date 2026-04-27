import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const OrganizationSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Organization'),
  organizationName: z.string().max(70),
  branch: z.string().max(35).optional(),
  address: safeIri().optional(),
  contactPersons: z.array(safeIri()).optional(),
}).strict()

export type Organization = z.infer<typeof OrganizationSchema>
export type JsonLdOrganization = JsonLd<'Organization'>
