import { describe, expect, it } from 'vitest'
import {
  BookingSegmentCodec,
  BookingSegmentSchema,
  deserializeBookingSegment,
  serializeBookingSegment,
} from '../../../../src/classes/booking-segment/index.js'
import { createBookingSegment } from '../../../factories/booking-segment.js'
import { fieldEquivalent } from '../../../util/field-equivalent.js'

describe('BookingSegment', () => {
  it('round-trips field-equivalent', () => {
    const seg = BookingSegmentSchema.parse(createBookingSegment())
    const r = deserializeBookingSegment(serializeBookingSegment(seg))
    expect(r.ok).toBe(true)
    if (r.ok) expect(fieldEquivalent(r.value, seg)).toBe(true)
  })

  it('rejects unknown @context with unknown_context', () => {
    const r = deserializeBookingSegment({
      ...createBookingSegment(),
      '@context': 'https://attacker/x',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('unknown_context')
  })

  it('rejects invalid IRI in transportMovement with invalid_iri', () => {
    const r = deserializeBookingSegment({
      ...createBookingSegment(),
      transportMovement: 'not-a-valid-iri',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('invalid_iri')
  })

  it('serializeStrict returns ParseResult', () => {
    const seg = BookingSegmentSchema.parse(createBookingSegment())
    const r = BookingSegmentCodec.serializeStrict(seg)
    expect(r.ok).toBe(true)
  })

  it('codec.type is literal-narrowed to "BookingSegment"', () => {
    expect(BookingSegmentCodec.type).toBe('BookingSegment')
  })
})
