import { describe, expect, it } from 'vitest'
import { BookingSchema, deserializeBooking } from '../../../../src/classes/booking/index.js'
import { createBooking } from '../../../factories/booking.js'
import { envelope } from '../../../factories/common.js'
import { BookingSchema as S05 } from '../../../oracle/v0.5.0/index.js'

const IRI = (s: string) => `https://1r.example.com/logistics-objects/${s}`

describe('Booking ontology realignment', () => {
  it('G4a: 0.5.0 values parse identically', () => {
    for (const x of [createBooking(), createBooking({ bookingStatus: 'REQUEST_REVOKED' })]) {
      expect(BookingSchema.parse(x)).toEqual(S05.parse(x))
      expect(Object.keys(BookingSchema.parse(x))).toEqual(Object.keys(S05.parse(x)))
    }
  })

  it('G4b: cargo-erp projector-equivalent Booking parses', () => {
    const r = deserializeBooking({
      ...envelope('Booking'),
      bookingStatus: 'CONFIRMED',
      bookingRequest: IRI('br'),
      carrierProduct: { productCode: 'GEN' },
      bookingTimes: [{ latestArrivalTime: '2026-11-21T06:00:00Z' }],
      bookingSegments: [
        {
          '@type': 'BookingSegment',
          spaceAllocationCode: 'KK',
          transportLegs: IRI('tl1'),
          pieceGroups: [
            {
              '@type': 'PieceGroup',
              pieceGroupCount: 3,
              pieceGroupGrossWeight: { numericalValue: 120, unit: 'KGM' },
            },
          ],
        },
      ],
      departureLocation: IRI('osl'),
      arrivalLocation: IRI('trd'),
      issuedForWaybill: IRI('wb'),
      waybillPrefix: '020',
      waybillNumber: '12345675',
      transportLegs: [IRI('tl1')],
      contactPersons: [IRI('p1')],
      contactDetails: [{ contactDetailType: 'EMAIL_ADDRESS', textualValue: 'ops@x.example' }],
      activitySequences: [{ activity: IRI('act1'), sequenceNumber: '1' }],
    })
    expect(r.ok).toBe(true)
  })

  it('G4b: envelope-only Booking parses', () => {
    expect(deserializeBooking({ ...envelope('Booking') }).ok).toBe(true)
  })

  it('G4c: bookingRequest + legacy forBookingRequest parse together', () => {
    const r = deserializeBooking({
      ...envelope('Booking'),
      bookingRequest: IRI('br'),
      forBookingRequest: IRI('br'),
      forBookingOption: IRI('bo'),
      bookingStatus: 'REQUEST_ACCEPTED',
    })
    expect(r.ok).toBe(true)
  })

  it('G4d: skeletonIndicator → zod_validation, code unrecognized_keys', () => {
    const r = deserializeBooking({ ...envelope('Booking'), skeletonIndicator: true })
    expect(r.ok).toBe(false)
    if (!r.ok && r.error.kind === 'zod_validation') {
      expect(r.error.issues[0]?.code).toBe('unrecognized_keys')
    } else {
      expect.unreachable('expected zod_validation')
    }
  })

  it("bookingStatus 'DELETED' parses", () => {
    expect(deserializeBooking({ ...envelope('Booking'), bookingStatus: 'DELETED' }).ok).toBe(true)
  })

  it('bookingSegments: [] → cardinality_violation', () => {
    const r = deserializeBooking({ ...envelope('Booking'), bookingSegments: [] })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('cardinality_violation')
  })

  it('Review Focus 2: additionalInformation scalar → zod_validation at path additionalInformation; [text] ok', () => {
    const r = deserializeBooking({ ...envelope('Booking'), additionalInformation: 'text' })
    expect(r.ok).toBe(false)
    if (!r.ok && r.error.kind === 'zod_validation') {
      expect(r.error.issues[0]?.path).toBe('additionalInformation')
    } else {
      expect.unreachable('expected zod_validation')
    }
    expect(deserializeBooking({ ...envelope('Booking'), additionalInformation: ['text'] }).ok).toBe(
      true,
    )
  })
})
