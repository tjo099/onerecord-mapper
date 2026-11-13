import { z } from 'zod'
import { TransportMeansServiceType } from '../../codes/enums.js'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

// :TransportLegs L9424
export const TransportLegsSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('TransportLegs'),
  arrivalDate: z.string().datetime({ offset: true }).optional(), // L3008
  arrivalLocation: safeIri().optional(), // L301 → :Location
  co2Emissions: safeIri().optional(), // L613 → :CO2Emissions (as TransportMovement.co2Emissions)
  departureDate: z.string().datetime({ offset: true }).optional(), // L3343
  departureLocation: safeIri().optional(), // L873 → :Location
  legNumber: z.number().int().optional(), // L3694 xsd:integer
  operatingTransportMeans: safeIri().optional(), // L1715 → :TransportMeans (not modelled)
  transportIdentifier: z.string().max(17).optional(), // L4623 (as TransportMovement.transportIdentifier)
  transportMeansServiceType: TransportMeansServiceType.optional(), // L2592
  transportMeansType: z.string().min(1).max(16).optional(), // L2600 → :CodeListElement
}).strict()

export type TransportLegs = z.infer<typeof TransportLegsSchema>
export type JsonLdTransportLegs = JsonLd<'TransportLegs'>
