// src/classes/booking-segment/schema.ts
import { z } from 'zod'
import { safeIri } from '../../iri/zod-safe-iri.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

export const BookingSegmentSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('BookingSegment'),
  transportMovement: safeIri(),
  sequenceNumber: z.number().int().positive(),
  loadingLocation: safeIri().optional(),
  unloadingLocation: safeIri().optional(),
}).strict()

export type BookingSegment = z.infer<typeof BookingSegmentSchema>
export type JsonLdBookingSegment = JsonLd<'BookingSegment'>
