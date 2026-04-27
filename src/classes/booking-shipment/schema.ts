// src/classes/booking-shipment/schema.ts
import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const BookingShipmentSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('BookingShipment'),
  forShipment: safeIri(),
  pieceCount: z.number().int().positive(),
  totalGrossWeight: z
    .object({ unit: z.literal('KGM'), value: z.number().nonnegative() })
    .optional(),
}).strict()

export type BookingShipment = z.infer<typeof BookingShipmentSchema>
export type JsonLdBookingShipment = JsonLd<'BookingShipment'>
