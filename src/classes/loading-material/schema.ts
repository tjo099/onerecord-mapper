import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'
import { OtherIdentifierSchema } from '../shared/value.js'

export const LoadingMaterialSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('LoadingMaterial'),
  description: z.string().min(1).max(512).optional(),   // :description xsd:string max1
  materialType: z.string().min(1).max(64).optional(),   // :materialType xsd:string max1
  materialModel: z.string().min(1).max(64).optional(),  // :materialModel xsd:string max1
  serialNumber: z.string().min(1).max(64).optional(),   // :serialNumber xsd:string max1
  manufacturer: safeIri().optional(),                   // :manufacturer → :Organization max1
  otherIdentifiers: z.array(OtherIdentifierSchema).optional(),
}).strict()

export type LoadingMaterial = z.infer<typeof LoadingMaterialSchema>
export type JsonLdLoadingMaterial = JsonLd<'LoadingMaterial'>
