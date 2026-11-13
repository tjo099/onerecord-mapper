import { describe, expect, it } from 'vitest'
import {
  BookingOptionStatus,
  BookingStatus,
  ChargeIdentifier,
  EntitlementCode,
  PrepaidCollectIndicator,
  SpaceAllocationCode,
  TransportMeansServiceType,
} from '../../../src/index.js'

const sorted = (e: { options: readonly string[] }) => [...e.options].sort()

describe('quote/book code enums', () => {
  it('BookingStatus has the ontology values', () =>
    expect(sorted(BookingStatus)).toEqual(['CONFIRMED', 'DELETED', 'QUEUED', 'REJECTED']))
  it('BookingOptionStatus keeps both NONBOOKABLE and NOT_BOOKABLE', () =>
    expect(sorted(BookingOptionStatus)).toEqual([
      'BOOKABLE',
      'BOOKED',
      'EXPIRED',
      'NONBOOKABLE',
      'NOT_BOOKABLE',
      'ON_REQUEST',
      'QUEUED',
    ]))
  it('legacy request values no longer parse as BookingStatus', () =>
    expect(BookingStatus.safeParse('REQUEST_ACCEPTED').success).toBe(false))
  it('ChargeIdentifier has the 11 code-list values', () =>
    expect(sorted(ChargeIdentifier)).toEqual([
      'CN',
      'CO',
      'CT',
      'IN',
      'NI',
      'OA',
      'OC',
      'SI',
      'TX',
      'VC',
      'WT',
    ]))
  it('PrepaidCollectIndicator has P and C', () =>
    expect(sorted(PrepaidCollectIndicator)).toEqual(['C', 'P']))
  it('EntitlementCode has C and A', () => expect(sorted(EntitlementCode)).toEqual(['A', 'C']))
  it('SpaceAllocationCode has the 14 values', () =>
    expect(sorted(SpaceAllocationCode)).toEqual([
      'CA',
      'CN',
      'HK',
      'HL',
      'HN',
      'KK',
      'LL',
      'NA',
      'NL',
      'NN',
      'SS',
      'UN',
      'UU',
      'XX',
    ]))
  it('TransportMeansServiceType has the 4 values', () =>
    expect(sorted(TransportMeansServiceType)).toEqual([
      'FREIGHTER',
      'MIXED_CONFIGURATION_COMBI',
      'PASSENGER',
      'TRUCK',
    ]))
})
