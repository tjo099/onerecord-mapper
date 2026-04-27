import { describe, expect, it } from 'vitest'
import {
  BookingTimesCodec,
  BookingTimesSchema,
  deserializeBookingTimes,
  serializeBookingTimes,
} from '../../../../src/classes/booking-times/index.js'
import { createBookingTimes } from '../../../factories/booking-times.js'
import { fieldEquivalent } from '../../../util/field-equivalent.js'

describe('BookingTimes', () => {
  it('round-trips field-equivalent', () => {
    const bt = BookingTimesSchema.parse(createBookingTimes())
    const r = deserializeBookingTimes(serializeBookingTimes(bt))
    expect(r.ok).toBe(true)
    if (r.ok) expect(fieldEquivalent(r.value, bt)).toBe(true)
  })

  it('rejects unknown @context with unknown_context', () => {
    const r = deserializeBookingTimes({ ...createBookingTimes(), '@context': 'https://attacker/x' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('unknown_context')
  })

  it('serializeStrict returns ParseResult', () => {
    const bt = BookingTimesSchema.parse(createBookingTimes())
    const r = BookingTimesCodec.serializeStrict(bt)
    expect(r.ok).toBe(true)
  })

  it('codec.type is literal-narrowed to "BookingTimes"', () => {
    expect(BookingTimesCodec.type).toBe('BookingTimes')
  })
})
