// src/classes/booking-option/schema.ts
import { z } from 'zod'
import { BookingOptionStatus } from '../../codes/enums.js'
import { safeIri } from '../../iri/zod-safe-iri.js'
import {
  CarrierProductSchema,
  EmbeddedBookingTimesSchema,
  StationRemarksSchema,
  UnitsPreferenceSchema,
} from '../shared/distribution.js'
import type { JsonLd } from '../shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../shared/logistics-object.js'

// Line citations (Lnnnn) refer to the official 2025-07-standard ontology file at
// IATA commit 49e8ac1b. :BookingOption is at L5298.
export const BookingOptionSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('BookingOption'),
  forBookingRequest: safeIri().optional(), // L1158, was required in 0.5.0
  /** @deprecated Not a ONE Record property. Use `statusBookingOption`. Removal: booking Path A (deviation #18). */
  optionStatus: z.enum(['OPTION_PROPOSED', 'OPTION_ACCEPTED', 'OPTION_REJECTED']).optional(),
  /** @deprecated Not a ONE Record property. Use `offerValidTo`. Removal: booking Path A (deviation #18). */
  expiresAt: z.string().datetime({ offset: true }).optional(),
  /** @deprecated Not a ONE Record property of BookingOption. Removal: booking Path A (deviation #18). */
  preferences: safeIri().optional(),
  // :BookingOption own properties
  additionalInformation: z.string().min(1).max(512).optional(), // L2924, max 1 here
  alternatives: z.array(z.string().min(1).max(512)).optional(), // L2976
  bookingTimes: EmbeddedBookingTimesSchema.optional(), // L437, max 1 here
  carrier: safeIri().optional(), // L471
  carrierProduct: CarrierProductSchema.optional(), // L495
  forBookingOptionRequest: safeIri().optional(), // L1148
  offerValidFrom: z.string().datetime({ offset: true }).optional(), // L3948
  offerValidTo: z.string().datetime({ offset: true }).optional(), // L3956
  price: safeIri().optional(), // L2000
  requestMatch: z.boolean().optional(), // L4286
  stationRemarks: z.array(StationRemarksSchema).optional(), // L2394
  statusBookingOption: BookingOptionStatus.optional(), // L2402
  transportLegs: z.array(safeIri()).optional(), // L2584
  unitsPreference: UnitsPreferenceSchema.optional(), // L2721
}).strict()

type BookingOptionInferred = z.infer<typeof BookingOptionSchema>
export type BookingOption = Omit<
  BookingOptionInferred,
  'optionStatus' | 'expiresAt' | 'preferences'
> & {
  /** @deprecated Not a ONE Record property. Use `statusBookingOption`. Removal: booking Path A (deviation #18). */
  optionStatus?: BookingOptionInferred['optionStatus']
  /** @deprecated Not a ONE Record property. Use `offerValidTo`. Removal: booking Path A (deviation #18). */
  expiresAt?: BookingOptionInferred['expiresAt']
  /** @deprecated Not a ONE Record property of BookingOption. Removal: booking Path A (deviation #18). */
  preferences?: BookingOptionInferred['preferences']
}
export type JsonLdBookingOption = JsonLd<'BookingOption'>
