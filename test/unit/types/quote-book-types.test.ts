// Every type added in 0.6.0 must be importable from both the package root and
// the zero-runtime types barrel. Type imports are erased at runtime; the
// compiler (bun run typecheck) is the real assertion here.
import { describe, expect, it } from 'vitest'

import type {
  ActivitySequence,
  BookingOptionStatus,
  BookingStatus,
  CarrierProduct,
  ChargeIdentifier,
  ContactDetail,
  EmbeddedBookingSegment,
  EmbeddedBookingTimes,
  EntitlementCode,
  JsonLdPrice,
  JsonLdRatings,
  JsonLdTransportLegs,
  PieceGroup,
  PrepaidCollectIndicator,
  Price,
  Ranges,
  Ratings,
  SpaceAllocationCode,
  StationRemarks,
  TransportLegs,
  TransportMeansServiceType,
  UnitsPreference,
} from '../../../src/index.js'
import type {
  ActivitySequence as TActivitySequence,
  BookingOptionStatus as TBookingOptionStatus,
  BookingStatus as TBookingStatus,
  CarrierProduct as TCarrierProduct,
  ChargeIdentifier as TChargeIdentifier,
  ContactDetail as TContactDetail,
  EmbeddedBookingSegment as TEmbeddedBookingSegment,
  EmbeddedBookingTimes as TEmbeddedBookingTimes,
  EntitlementCode as TEntitlementCode,
  JsonLdPrice as TJsonLdPrice,
  JsonLdRatings as TJsonLdRatings,
  JsonLdTransportLegs as TJsonLdTransportLegs,
  PieceGroup as TPieceGroup,
  PrepaidCollectIndicator as TPrepaidCollectIndicator,
  Price as TPrice,
  Ranges as TRanges,
  Ratings as TRatings,
  SpaceAllocationCode as TSpaceAllocationCode,
  StationRemarks as TStationRemarks,
  TransportLegs as TTransportLegs,
  TransportMeansServiceType as TTransportMeansServiceType,
  UnitsPreference as TUnitsPreference,
} from '../../../src/types/index.js'

// Both entry points must name the very same type (mutually assignable).
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
const same = <A, B>(_ok: Same<A, B>): void => {}

describe('0.6.0 types are importable from the root and the types barrel', () => {
  it('root and barrel agree on every type', () => {
    same<Price, TPrice>(true)
    same<JsonLdPrice, TJsonLdPrice>(true)
    same<Ratings, TRatings>(true)
    same<JsonLdRatings, TJsonLdRatings>(true)
    same<TransportLegs, TTransportLegs>(true)
    same<JsonLdTransportLegs, TJsonLdTransportLegs>(true)
    same<BookingStatus, TBookingStatus>(true)
    same<BookingOptionStatus, TBookingOptionStatus>(true)
    same<ChargeIdentifier, TChargeIdentifier>(true)
    same<PrepaidCollectIndicator, TPrepaidCollectIndicator>(true)
    same<EntitlementCode, TEntitlementCode>(true)
    same<SpaceAllocationCode, TSpaceAllocationCode>(true)
    same<TransportMeansServiceType, TTransportMeansServiceType>(true)
    same<Ranges, TRanges>(true)
    same<UnitsPreference, TUnitsPreference>(true)
    same<CarrierProduct, TCarrierProduct>(true)
    same<StationRemarks, TStationRemarks>(true)
    same<EmbeddedBookingTimes, TEmbeddedBookingTimes>(true)
    same<PieceGroup, TPieceGroup>(true)
    same<EmbeddedBookingSegment, TEmbeddedBookingSegment>(true)
    same<ActivitySequence, TActivitySequence>(true)
    same<ContactDetail, TContactDetail>(true)
    expect(true).toBe(true)
  })

  it('accepts a sample value of each new class type', () => {
    const base = { '@context': 'https://onerecord.iata.org/ns/cargo' } as const
    const price: Price = { ...base, '@type': 'Price', '@id': 'https://example.com/p/1' }
    const ratings: Ratings = { ...base, '@type': 'Ratings', '@id': 'https://example.com/r/1' }
    const legs: TransportLegs = {
      ...base,
      '@type': 'TransportLegs',
      '@id': 'https://example.com/tl/1',
      legNumber: 1,
    }
    expect(price['@type']).toBe('Price')
    expect(ratings['@type']).toBe('Ratings')
    expect(legs['@type']).toBe('TransportLegs')
  })
})
