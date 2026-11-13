import { describe, expect, it } from 'vitest'
import {
  ActivitySequenceSchema,
  CarrierProductSchema,
  ContactDetailSchema,
  EmbeddedBookingSegmentSchema,
  EmbeddedBookingTimesSchema,
  PieceGroupSchema,
  RangesSchema,
  StationRemarksSchema,
  UnitsPreferenceSchema,
  XSD_DURATION,
} from '../../../../src/classes/shared/distribution.js'

const val = { numericalValue: 1, unit: 'KGM' }
const dt = '2026-01-01T00:00:00Z'

const shapes = [
  [
    'Ranges',
    RangesSchema,
    {
      rateClassCode: 'Q',
      uldRateClassType: 'BT',
      maximumQuantity: 100,
      minimumQuantity: 1,
      unitBasis: 'KG',
    },
  ],
  [
    'UnitsPreference',
    UnitsPreferenceSchema,
    {
      currency: 'NOK',
      dimensionsUnit: 'CMT',
      temperatureUnit: 'CEL',
      volumeUnit: 'MTQ',
      weightUnit: 'KGM',
    },
  ],
  [
    'CarrierProduct',
    CarrierProductSchema,
    { productCode: 'GEN', serviceLevelCode: 'STD', productDescription: 'General' },
  ],
  [
    'StationRemarks',
    StationRemarksSchema,
    { station: 'https://x.example/loc/1', remarksText: 'NOTE: prepaid' },
  ],
  [
    'BookingTimes',
    EmbeddedBookingTimesSchema,
    {
      earliestAcceptanceTime: dt,
      latestAcceptanceTime: dt,
      latestArrivalTime: dt,
      timeOfAvailability: dt,
      totalTransitTime: 'PT5H30M',
    },
  ],
  [
    'PieceGroup',
    PieceGroupSchema,
    { dryIceWeight: val, pieceGroupCount: 2, pieceGroupGrossWeight: val, pieceGroupId: 1 },
  ],
  [
    'BookingSegment',
    EmbeddedBookingSegmentSchema,
    {
      allotmentCode: 'A1',
      pieceGroups: [{ pieceGroupCount: 1 }],
      spaceAllocationCode: 'KK',
      transportLegs: 'https://x.example/tl/1',
    },
  ],
  [
    'ActivitySequence',
    ActivitySequenceSchema,
    { activity: 'https://x.example/act/1', sequenceNumber: '1' },
  ],
  [
    'ContactDetail',
    ContactDetailSchema,
    { contactDetailType: 'EMAIL', textualValue: 'a@b.example' },
  ],
] as const

describe.each(shapes)('%s shape', (name, schema, full) => {
  it('parses {}', () => expect(schema.safeParse({}).success).toBe(true))
  it('parses all fields set', () => expect(schema.safeParse(full).success).toBe(true))
  it('accepts its own @type', () => expect(schema.safeParse({ '@type': name }).success).toBe(true))
  it('rejects @id', () =>
    expect(schema.safeParse({ '@id': 'https://x.example/a' }).success).toBe(false))
  it('rejects unknown keys', () => expect(schema.safeParse({ unknownKey: 1 }).success).toBe(false))
  it('rejects a wrong @type', () =>
    expect(schema.safeParse({ '@type': 'WrongName' }).success).toBe(false))
})

describe('distribution specifics', () => {
  it.each(['PT5H30M', 'P1D', 'P1Y2M3DT4H5M6.5S', '-P1D'])('duration %s accepted', (d) =>
    expect(EmbeddedBookingTimesSchema.safeParse({ totalTransitTime: d }).success).toBe(true),
  )
  it.each(['P', 'PT', 'P1DT', '5H', 'P1.5D'])('duration %s rejected', (d) =>
    expect(EmbeddedBookingTimesSchema.safeParse({ totalTransitTime: d }).success).toBe(false),
  )
  it('XSD_DURATION is the plain-alternation regex', () =>
    expect(XSD_DURATION.source).toContain(String.raw`(?=\d|T\d)`))
  it('datetimes require a timezone', () => {
    const p = (v: string) => EmbeddedBookingTimesSchema.safeParse({ latestArrivalTime: v }).success
    expect(p('2026-01-01T00:00:00Z')).toBe(true)
    expect(p('2026-01-01T00:00:00+02:00')).toBe(true)
    expect(p('2026-01-01T00:00:00')).toBe(false)
  })
  it('pieceGroupCount must be an integer', () =>
    expect(PieceGroupSchema.safeParse({ pieceGroupCount: 1.5 }).success).toBe(false))
  it('BookingSegment.transportLegs is one IRI, not an array', () => {
    expect(
      EmbeddedBookingSegmentSchema.safeParse({ transportLegs: 'https://x.example/tl/1' }).success,
    ).toBe(true)
    expect(
      EmbeddedBookingSegmentSchema.safeParse({ transportLegs: ['https://x.example/tl/1'] }).success,
    ).toBe(false)
  })
  it('spaceAllocationCode is the closed list', () =>
    expect(EmbeddedBookingSegmentSchema.safeParse({ spaceAllocationCode: 'ZZ' }).success).toBe(
      false,
    ))
  it('ContactDetail accepts 23-char ALTERNATE_EMAIL_ADDRESS', () =>
    expect(
      ContactDetailSchema.safeParse({
        contactDetailType: 'ALTERNATE_EMAIL_ADDRESS',
        textualValue: 'a@b.example',
      }).success,
    ).toBe(true))
  it('UnitsPreference rejects a wrong @type', () =>
    expect(UnitsPreferenceSchema.safeParse({ '@type': 'Value', currency: 'NOK' }).success).toBe(
      false,
    ))
})
