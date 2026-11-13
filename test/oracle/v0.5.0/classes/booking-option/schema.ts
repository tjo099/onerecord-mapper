// FROZEN ORACLE: verbatim `git show v0.5.0:src/classes/booking-option/schema.ts`; only relative imports to unchanged shared modules were repointed to src/. Do not edit.
// src/classes/booking-option/schema.ts
import { z } from 'zod'
import type { JsonLd } from '../../../../../src/classes/shared/jsonld-brand.js'
import { LogisticsObjectSchema } from '../../../../../src/classes/shared/logistics-object.js'
import { safeIri } from '../../../../../src/iri/zod-safe-iri.js'

export const BookingOptionSchema = LogisticsObjectSchema.extend({
  '@type': z.literal('BookingOption'),
  forBookingRequest: safeIri(),
  optionStatus: z.enum(['OPTION_PROPOSED', 'OPTION_ACCEPTED', 'OPTION_REJECTED']),
  expiresAt: z.string().datetime({ offset: true }).optional(),
  preferences: safeIri().optional(),
}).strict()

export type BookingOption = z.infer<typeof BookingOptionSchema>
export type JsonLdBookingOption = JsonLd<'BookingOption'>
