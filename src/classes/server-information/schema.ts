import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const ServerInformationSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('ServerInformation'),
  serverEndpoint: safeIri(),
  cargoOntologyVersion: z
    .string()
    .regex(/^\d+\.\d+(\.\d+)?$/)
    .optional(),
  apiSpecVersion: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .optional(),
  supportedLogisticsObjectTypes: z.array(z.string()).optional(),
}).strict()

export type ServerInformation = z.infer<typeof ServerInformationSchema>
export type JsonLdServerInformation = JsonLd<'ServerInformation'>
