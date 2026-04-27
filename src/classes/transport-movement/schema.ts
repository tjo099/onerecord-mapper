import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const TransportMovementSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('TransportMovement'),
  transportIdentifier: z.string().max(17),
  modeCode: z.enum(['AIR', 'TRUCK', 'RAIL', 'SEA']),
  departureLocation: safeIri(),
  arrivalLocation: safeIri(),
  movementTimes: z.array(safeIri()).optional(),
}).strict()

export type TransportMovement = z.infer<typeof TransportMovementSchema>
export type JsonLdTransportMovement = JsonLd<'TransportMovement'>
