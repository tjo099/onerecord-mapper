import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'
import { OtherIdentifierSchema } from '../shared/value.js'

export const CompanySchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Company'),
  name: z.string().min(1).max(256).optional(),
  shortName: z.string().min(1).max(64).optional(),
  iataCargoAgentCode: z
    .string()
    .regex(/^[0-9-]{1,7}$/)
    .optional(),
  iataCargoAgentLocationIdentifier: z
    .string()
    .regex(/^[0-9-]{1,4}$/)
    .optional(),
  basedAtLocation: safeIri().optional(),
  contactPersons: z.array(safeIri()).optional(),
  otherIdentifiers: z.array(OtherIdentifierSchema).optional(),
  parentOrganization: safeIri().optional(),
  subOrganization: z.array(safeIri()).optional(),
}).strict()

export type Company = z.infer<typeof CompanySchema>
export type JsonLdCompany = JsonLd<'Company'>
