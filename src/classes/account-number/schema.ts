import { z } from 'zod'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const AccountNumberSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('AccountNumber'),
  // :accountNumberType → :AccountType, owl:maxCardinality 1 (TTL DM 4780/4784-4785).
  // String per open-codelist idiom — :AccountType is rdfs:subClassOf :CodeListElement,
  // no owl:oneOf in DM or CL ontology (DM TTL 4801-4805).
  accountNumberType: z.string().min(1).max(16).optional(),
  // :textualValue → xsd:string, owl:maxCardinality 1 (TTL DM 4788/4791-4793). .max(35) = FWB account
  // field width (editorial — the ontology has no length facet).
  textualValue: z.string().min(1).max(35).optional(),
}).strict()

export type AccountNumber = z.infer<typeof AccountNumberSchema>
export type JsonLdAccountNumber = JsonLd<'AccountNumber'>
