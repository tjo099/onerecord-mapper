import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'
import { ValueSchema } from '../shared/value.js'

export const ULDSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('ULD'),
  // DIRECT :ULD owl:Restriction fields (TTL 9700-9817)
  uldTypeCode: z.string().min(1).max(16).optional(), // TTL 9724-9726 → :CodeListElement max1
  uldSerialNumber: z.string().min(1).max(32).optional(), // TTL 9780-9782 xsd:string max1
  ownerCode: z.string().min(1).max(16).optional(), // TTL 9715-9717 → :CodeListElement max1
  loadingIndicator: z.string().min(1).max(16).optional(), // TTL 9707-9709 → codes:ULDLoadingIndicator max1
  ataDesignator: z.string().min(1).max(16).optional(), // TTL 9752-9754 xsd:string max1
  demurrageCode: z.string().min(1).max(16).optional(), // TTL 9704-9706 → codes:DemurrageCode max1
  odlnCode: z.string().min(1).max(16).optional(), // TTL 9711-9713 → :CodeListElement max1
  serviceabilityCode: z.string().min(1).max(16).optional(), // TTL 9719-9721 → codes:ULDConditionCode max1
  damageFlag: z.boolean().optional(), // TTL 9756-9758 xsd:boolean max1
  numberOfDoors: z.number().int().nonnegative().optional(), // TTL 9760-9762 xsd:integer max1
  numberOfFittings: z.number().int().nonnegative().optional(), // TTL 9763-9765 xsd:integer max1
  numberOfNets: z.number().int().nonnegative().optional(), // TTL 9767-9769 xsd:integer max1
  numberOfStraps: z.number().int().nonnegative().optional(), // TTL 9771-9773 xsd:integer max1
  sealNumber: z.string().min(1).max(32).optional(), // TTL 9775-9777 xsd:string max1
  // domain-inherited via :LoadingUnit (owl:Restriction :inUnitComposition allValuesFrom :UnitComposition TTL 7402-7404, maxCardinality 1 TTL 7410-7412) — NOT a :ULD class restriction
  inUnitComposition: safeIri().optional(), // TTL 7402-7404 → :UnitComposition max1
  // domain-inherited via :LoadingUnit (owl:Restriction :tareWeight allValuesFrom :Value TTL 7406-7408, maxCardinality 1 TTL 7414-7416) — NOT a :ULD class restriction
  tareWeight: ValueSchema.optional(),
  // domain-inherited via :LoadingUnit (owl:Restriction :remarks allValuesFrom xsd:string TTL 7418-7420, maxCardinality 1 TTL 7422-7424) — NOT a :ULD class restriction
  remarks: z.string().min(1).max(512).optional(),
}).strict()

export type ULD = z.infer<typeof ULDSchema>
export type JsonLdULD = JsonLd<'ULD'>
