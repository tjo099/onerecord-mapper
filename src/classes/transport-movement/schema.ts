import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'
import { ValueSchema } from '../shared/value.js'

export const TransportMovementSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('TransportMovement'),
  transportIdentifier: z.string().max(17),
  modeCode: z.enum(['AIR', 'TRUCK', 'RAIL', 'SEA']),
  departureLocation: safeIri(),
  arrivalLocation: safeIri(),
  movementTimes: z.array(safeIri()).optional(),
  co2Emissions: safeIri().optional(),
  fuelType: z.string().min(1).max(64).optional(),
  fuelAmountCalculated: ValueSchema.optional(),
  fuelAmountMeasured: ValueSchema.optional(),
  distanceCalculated: ValueSchema.optional(),
  distanceMeasured: ValueSchema.optional(),
}).strict()

export type TransportMovement = z.infer<typeof TransportMovementSchema>
export type JsonLdTransportMovement = JsonLd<'TransportMovement'>
