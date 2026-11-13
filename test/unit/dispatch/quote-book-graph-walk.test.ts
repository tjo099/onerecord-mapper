import { describe, expect, it } from 'vitest'
import { dispatchGraphWalk } from '../../../src/dispatch/graph-walk.js'
import { looksLikeIri } from '../../../src/dispatch/iri-canonical.js'

const CTX = 'https://onerecord.iata.org/ns/cargo'
const BASE = 'https://example.org/logistics-objects'
const id = (n: string) => `${BASE}/${n}`

function expectError(r: ReturnType<typeof dispatchGraphWalk>, kind: string) {
  expect(r.ok).toBe(false)
  if (r.ok) throw new Error('unreachable')
  expect(r.error.kind).toBe(kind)
  return r.error
}

describe('T10 graph walk: Quote & Book links', () => {
  describe('Waybill.referredBookingOption', () => {
    const waybill = (embedded: Record<string, unknown>) => ({
      '@context': { cargo: CTX },
      '@type': 'Waybill',
      '@id': id('wb'),
      referredBookingOption: embedded,
    })

    it('passes with an embedded Booking carrying @id', () => {
      const r = dispatchGraphWalk(waybill({ '@type': 'Booking', '@id': id('bk') }), 'Waybill')
      expect(r.ok).toBe(true)
    })

    it('rejects an embedded BookingOption (wrong_type_for_endpoint)', () => {
      const r = dispatchGraphWalk(waybill({ '@type': 'BookingOption', '@id': id('bo') }), 'Waybill')
      const e = expectError(r, 'wrong_type_for_endpoint')
      expect(e).toMatchObject({ expected: 'Booking', got: 'BookingOption' })
    })
  })

  describe('BookingOption.price', () => {
    const option = (price: Record<string, unknown>) => ({
      '@context': { cargo: CTX },
      '@type': 'BookingOption',
      '@id': id('bo'),
      price,
    })

    it('passes with an embedded Price carrying @id', () => {
      const r = dispatchGraphWalk(option({ '@type': 'Price', '@id': id('pr') }), 'BookingOption')
      expect(r.ok).toBe(true)
    })

    it('missing_id for an embedded Price without @id', () => {
      const e = expectError(
        dispatchGraphWalk(option({ '@type': 'Price' }), 'BookingOption'),
        'missing_id',
      )
      expect(e).toMatchObject({ objectType: 'Price', path: '$.price' })
    })

    it('wrong_type_for_endpoint for a Ratings node (with @id) under price', () => {
      const e = expectError(
        dispatchGraphWalk(option({ '@type': 'Ratings', '@id': id('rt') }), 'BookingOption'),
        'wrong_type_for_endpoint',
      )
      expect(e).toMatchObject({ expected: 'Price', got: 'Ratings' })
    })

    it('precedence: Ratings node without @id gives missing_id, not wrong_type_for_endpoint', () => {
      expectError(dispatchGraphWalk(option({ '@type': 'Ratings' }), 'BookingOption'), 'missing_id')
    })

    it('depth 2: wrong @type (with @id) under Price.ratings gives wrong_type_for_endpoint', () => {
      const r = dispatchGraphWalk(
        option({
          '@type': 'Price',
          '@id': id('pr'),
          ratings: { '@type': 'Price', '@id': id('pr2') },
        }),
        'BookingOption',
      )
      const e = expectError(r, 'wrong_type_for_endpoint')
      expect(e).toMatchObject({ expected: 'Ratings', got: 'Price', path: '$.price.ratings' })
    })

    it('depth 2: Ratings under Price.ratings passes', () => {
      const r = dispatchGraphWalk(
        option({
          '@type': 'Price',
          '@id': id('pr'),
          ratings: { '@type': 'Ratings', '@id': id('rt') },
        }),
        'BookingOption',
      )
      expect(r.ok).toBe(true)
    })
  })

  describe('embedded shapes', () => {
    const booking = (extra: Record<string, unknown>) => ({
      '@context': { cargo: CTX },
      '@type': 'Booking',
      '@id': id('bk'),
      ...extra,
    })

    it('embedded unitsPreference and bookingTimes without @id pass', () => {
      const r = dispatchGraphWalk(
        booking({
          unitsPreference: { currency: 'EUR' },
          bookingTimes: { bookingTimeType: 'x' },
        }),
        'Booking',
      )
      expect(r.ok).toBe(true)
    })

    it('segment with @type, no @id, nested pieceGroups with @type passes', () => {
      const r = dispatchGraphWalk(
        booking({
          bookingSegments: [
            {
              '@type': 'BookingSegment',
              pieceGroups: [
                { '@type': 'PieceGroup', dryIceWeight: { unit: 'KGM', value: 1 } },
                { '@type': 'PieceGroup', dryIceWeight: { unit: 'KGM', value: 2 } },
              ],
            },
          ],
        }),
        'Booking',
      )
      expect(r.ok).toBe(true)
    })

    it('the same segment without @type gives missing_type', () => {
      const r = dispatchGraphWalk(
        booking({
          bookingSegments: [
            {
              pieceGroups: [{ '@type': 'PieceGroup', dryIceWeight: { unit: 'KGM', value: 1 } }],
            },
          ],
        }),
        'Booking',
      )
      const e = expectError(r, 'missing_type')
      expect(e).toMatchObject({ path: '$.bookingSegments[0]' })
    })
  })

  describe('free text is not an IRI (Review Focus 5)', () => {
    it('Booking with colon-bearing free text passes the graph walk', () => {
      const r = dispatchGraphWalk(
        {
          '@context': { cargo: CTX },
          '@type': 'Booking',
          '@id': id('bk'),
          stationRemarks: [{ remarksText: 'NOTE: x' }],
          shippingInfo: 'ATTN: ops',
        },
        'Booking',
      )
      expect(r.ok).toBe(true)
    })

    it('looksLikeIri rejects whitespace-bearing strings', () => {
      expect(looksLikeIri('NOTE: prepaid')).toBe(false)
      expect(looksLikeIri('ATTN: ops')).toBe(false)
    })

    it('looksLikeIri accepts real IRIs, including non-canonical ones', () => {
      expect(looksLikeIri('https://x.example/a')).toBe(true)
      expect(looksLikeIri('HTTPS://X.example/a')).toBe(true)
    })

    it('a non-canonical IRI still yields iri_not_canonical', () => {
      const r = dispatchGraphWalk(
        {
          '@context': { cargo: CTX },
          '@type': 'Booking',
          '@id': id('bk'),
          bookingRequest: 'HTTPS://X.example/a',
        },
        'Booking',
      )
      expectError(r, 'iri_not_canonical')
    })
  })
})
