import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const CustomsInformationSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('CustomsInformation'),
  ociLineNumber: z.number().int().nonnegative().optional(),
  country: safeIri().optional(),
  subjectCode: z.string().min(1).max(16).optional(),
  contentCode: z.string().min(1).max(16).optional(),
  otherCustomsInformation: z.string().min(1).max(512).optional(),
  note: z.string().min(1).max(512).optional(),
  // owl:maxCardinality "1"^^xsd:nonNegativeInteger — TTL 6274-6277 — single, NOT array
  issuedForPiece: safeIri().optional(),
  // owl:maxCardinality "1"^^xsd:nonNegativeInteger — TTL 6278-6281
  issuedForShipment: safeIri().optional(),
}).strict()

export type CustomsInformation = z.infer<typeof CustomsInformationSchema>
export type JsonLdCustomsInformation = JsonLd<'CustomsInformation'>
