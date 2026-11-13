import { z } from 'zod'
import { SpaceAllocationCode } from '../../codes/enums.js'
import { safeIri } from '../../iri/zod-safe-iri.js'
import { ValueSchema } from './value.js'

// Embedded Quote & Book shapes (v0.6.0 spec §3). Internal schemas, following the
// value.ts precedent; only their types are exported. Line citations (Lnnnn) refer
// to the official 2025-07-standard ontology file at IATA commit 49e8ac1b.
// No shape has an @id.

/** xsd:duration (spec §2.1). Needs at least one component; `T` needs a time part. */
export const XSD_DURATION =
  /^-?P(?=\d|T\d)(?:\d+Y)?(?:\d+M)?(?:\d+D)?(?:T(?=\d)(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$/

// :Ranges L8919
export const RangesSchema = z
  .object({
    '@type': z.literal('Ranges').optional(),
    rateClassCode: z.string().min(1).max(8).optional(), // :rateClassCode L2068
    uldRateClassType: z.string().min(1).max(16).optional(), // :uldRateClassType L2664
    maximumQuantity: z.number().optional(), // :maximumQuantity L3797
    minimumQuantity: z.number().optional(), // :minimumQuantity L3837
    unitBasis: z.string().min(1).max(64).optional(), // :unitBasis L4671
  })
  .strict()
export type Ranges = z.infer<typeof RangesSchema>

// :UnitsPreference L9924
export const UnitsPreferenceSchema = z
  .object({
    '@type': z.literal('UnitsPreference').optional(),
    currency: z.string().min(1).optional(), // :currency L801
    dimensionsUnit: z.string().min(1).optional(), // :dimensionsUnit L951
    temperatureUnit: z.string().min(1).optional(), // :temperatureUnit L2519
    volumeUnit: z.string().min(1).optional(), // :volumeUnit L2772
    weightUnit: z.string().min(1).optional(), // :weightUnit L2831
  })
  .strict()
export type UnitsPreference = z.infer<typeof UnitsPreferenceSchema>

// :CarrierProduct L5855
export const CarrierProductSchema = z
  .object({
    '@type': z.literal('CarrierProduct').optional(),
    productCode: z.string().min(1).max(16).optional(), // :productCode L2009
    serviceLevelCode: z.string().min(1).max(16).optional(), // :serviceLevelCode L2291
    productDescription: z.string().min(1).max(256).optional(), // :productDescription L4151
  })
  .strict()
export type CarrierProduct = z.infer<typeof CarrierProductSchema>

// :StationRemarks L9317
export const StationRemarksSchema = z
  .object({
    '@type': z.literal('StationRemarks').optional(),
    station: safeIri().optional(), // :station L2386 (comment says mandatory; no cardinality restriction)
    remarksText: z.string().min(1).max(512).optional(), // :remarksText L4270
  })
  .strict()
export type StationRemarks = z.infer<typeof StationRemarksSchema>

// :BookingTimes L5744 (embedded; named to avoid the legacy LogisticsObject BookingTimes)
export const EmbeddedBookingTimesSchema = z
  .object({
    '@type': z.literal('BookingTimes').optional(),
    earliestAcceptanceTime: z.string().datetime({ offset: true }).optional(), // L3423
    latestAcceptanceTime: z.string().datetime({ offset: true }).optional(), // L3670
    latestArrivalTime: z.string().datetime({ offset: true }).optional(), // L3678
    timeOfAvailability: z.string().datetime({ offset: true }).optional(), // L4591
    totalTransitTime: z.string().regex(XSD_DURATION).optional(), // :totalTransitTime L4599
  })
  .strict()
export type EmbeddedBookingTimes = z.infer<typeof EmbeddedBookingTimesSchema>

// :PieceGroup L8460
export const PieceGroupSchema = z
  .object({
    '@type': z.literal('PieceGroup').optional(),
    dryIceWeight: ValueSchema.optional(), // :dryIceWeight L992
    pieceGroupCount: z.number().int().optional(), // :pieceGroupCount L4084
    pieceGroupGrossWeight: ValueSchema.optional(), // :pieceGroupGrossWeight L1926
    pieceGroupId: z.number().int().optional(), // :pieceGroupId L4092
  })
  .strict()
export type PieceGroup = z.infer<typeof PieceGroupSchema>

// :BookingSegment L5595 (embedded; named to avoid the legacy LogisticsObject BookingSegment)
export const EmbeddedBookingSegmentSchema = z
  .object({
    '@type': z.literal('BookingSegment').optional(),
    allotmentCode: z.string().min(1).max(64).optional(), // :allotmentCode L2969
    pieceGroups: z.array(PieceGroupSchema).optional(), // :pieceGroups L1934 (many)
    spaceAllocationCode: SpaceAllocationCode.optional(), // :spaceAllocationCode L2363
    transportLegs: safeIri().optional(), // :transportLegs L2584 (max 1 on BookingSegment)
  })
  .strict()
export type EmbeddedBookingSegment = z.infer<typeof EmbeddedBookingSegmentSchema>

// :ActivitySequence L4849
export const ActivitySequenceSchema = z
  .object({
    '@type': z.literal('ActivitySequence').optional(),
    activity: safeIri().optional(), // :activity L219 -> :LogisticsActivity
    sequenceNumber: z.string().min(1).max(64).optional(), // :sequenceNumber L4326
  })
  .strict()
export type ActivitySequence = z.infer<typeof ActivitySequenceSchema>

// :ContactDetail L6185
export const ContactDetailSchema = z
  .object({
    '@type': z.literal('ContactDetail').optional(),
    contactDetailType: z.string().min(1).max(64).optional(), // :contactDetailType L692 (open list)
    textualValue: z.string().min(1).optional(), // :textualValue L4583
  })
  .strict()
export type ContactDetail = z.infer<typeof ContactDetailSchema>
