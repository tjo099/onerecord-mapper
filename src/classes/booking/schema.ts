// src/classes/booking/schema.ts
import { z } from 'zod'
import { BookingStatus } from '../../codes/enums.js'
import { safeIri } from '../../iri/zod-safe-iri.js'
import {
  ActivitySequenceSchema,
  CarrierProductSchema,
  ContactDetailSchema,
  EmbeddedBookingSegmentSchema,
  EmbeddedBookingTimesSchema,
  StationRemarksSchema,
} from '../shared/distribution.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

// Line citations (Lnnnn) refer to the official 2025-07-standard ontology file at
// IATA commit 49e8ac1b. :Booking L5170 is a subclass of :LogisticsService L7717.
export const BookingSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('Booking'),
  /**
   * :bookingStatus L429. Besides the ontology BookingStatus values, the two
   * values 'REQUEST_ACCEPTED' and 'REQUEST_REVOKED' are still accepted for
   * 0.5.0 compatibility; they are not ontology values.
   */
  bookingStatus: z
    .enum([...BookingStatus.options, 'REQUEST_ACCEPTED', 'REQUEST_REVOKED'])
    .optional(),
  /** @deprecated Not a ONE Record property of Booking. Use `bookingRequest`. Removal: booking Path A (deviation #18). */
  forBookingRequest: safeIri().optional(),
  /** @deprecated Not a ONE Record property of Booking (chain is Booking → BookingRequest → BookingOption). Removal: booking Path A (deviation #18). */
  forBookingOption: safeIri().optional(),
  // :Booking own properties
  additionalInformation: z.array(z.string().min(1).max(512)).optional(), // L2924, many on Booking
  arrivalLocation: safeIri().optional(), // L301
  departureLocation: safeIri().optional(), // L873
  bookingRequest: safeIri().optional(), // L404
  bookingSegments: z.array(EmbeddedBookingSegmentSchema).optional(), // L413
  bookingShipmentDetails: safeIri().optional(), // L420
  bookingTimes: z.array(EmbeddedBookingTimesSchema).optional(), // L437, many on Booking
  carrier: safeIri().optional(), // L471
  carrierProduct: CarrierProductSchema.optional(), // L495
  issuedForWaybill: safeIri().optional(), // L1438
  shippingInfo: z.string().min(1).max(512).optional(), // L4350
  shippingRefNo: z.string().min(1).max(64).optional(), // L4366
  stationRemarks: z.array(StationRemarksSchema).optional(), // L2394
  transportLegs: z.array(safeIri()).optional(), // L2584
  updateBookingOptionRequests: z.array(safeIri()).optional(), // L2729
  waybillNumber: z
    .string()
    .regex(/^[A-Z0-9]+$/)
    .optional(), // L4751
  waybillPrefix: z
    .string()
    .regex(/^[A-Z0-9]{1,3}$/)
    .optional(), // L4764
  // inherited from :LogisticsService L7717
  activitySequences: z.array(ActivitySequenceSchema).optional(), // L227
  contactDetails: z.array(ContactDetailSchema).optional(), // L700
  contactPersons: z.array(safeIri()).optional(), // L708 -> :Actor
}).strict()

type BookingInferred = z.infer<typeof BookingSchema>
export type Booking = Omit<BookingInferred, 'forBookingRequest' | 'forBookingOption'> & {
  /** @deprecated Not a ONE Record property of Booking. Use `bookingRequest`. Removal: booking Path A (deviation #18). */
  forBookingRequest?: BookingInferred['forBookingRequest']
  /** @deprecated Not a ONE Record property of Booking (chain is Booking → BookingRequest → BookingOption). Removal: booking Path A (deviation #18). */
  forBookingOption?: BookingInferred['forBookingOption']
}
export type JsonLdBooking = JsonLd<'Booking'>
