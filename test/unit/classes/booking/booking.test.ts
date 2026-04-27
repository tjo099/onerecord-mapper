import { describe, expect, it } from 'vitest'
import {
  BookingCodec,
  BookingSchema,
  deserializeBooking,
  serializeBooking,
} from '../../../../src/classes/booking/index.js'
import { createBooking } from '../../../factories/booking.js'
import { fieldEquivalent } from '../../../util/field-equivalent.js'

describe('Booking', () => {
  it('round-trips field-equivalent', () => {
    const bk = BookingSchema.parse(createBooking())
    const r = deserializeBooking(serializeBooking(bk))
    expect(r.ok).toBe(true)
    if (r.ok) expect(fieldEquivalent(r.value, bk)).toBe(true)
  })

  it('rejects unknown @context with unknown_context', () => {
    const r = deserializeBooking({ ...createBooking(), '@context': 'https://attacker/x' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('unknown_context')
  })

  it('rejects invalid IRI in forBookingRequest with invalid_iri', () => {
    const r = deserializeBooking({ ...createBooking(), forBookingRequest: 'not-a-valid-iri' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('invalid_iri')
  })

  it('serializeStrict returns ParseResult', () => {
    const bk = BookingSchema.parse(createBooking())
    const r = BookingCodec.serializeStrict(bk)
    expect(r.ok).toBe(true)
  })

  it('codec.type is literal-narrowed to "Booking"', () => {
    expect(BookingCodec.type).toBe('Booking')
  })
})
