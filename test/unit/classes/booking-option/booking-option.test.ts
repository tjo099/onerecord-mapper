import { describe, expect, it } from 'vitest'
import {
  BookingOptionCodec,
  BookingOptionSchema,
  deserializeBookingOption,
  serializeBookingOption,
} from '../../../../src/classes/booking-option/index.js'
import { createBookingOption } from '../../../factories/booking-option.js'
import { fieldEquivalent } from '../../../util/field-equivalent.js'

describe('BookingOption', () => {
  it('round-trips field-equivalent', () => {
    const opt = BookingOptionSchema.parse(createBookingOption())
    const r = deserializeBookingOption(serializeBookingOption(opt))
    expect(r.ok).toBe(true)
    if (r.ok) expect(fieldEquivalent(r.value, opt)).toBe(true)
  })

  it('rejects unknown @context with unknown_context', () => {
    const r = deserializeBookingOption({
      ...createBookingOption(),
      '@context': 'https://attacker/x',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('unknown_context')
  })

  it('rejects invalid IRI in forBookingRequest with invalid_iri', () => {
    const r = deserializeBookingOption({
      ...createBookingOption(),
      forBookingRequest: 'not-a-valid-iri',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('invalid_iri')
  })

  it('serializeStrict returns ParseResult', () => {
    const opt = BookingOptionSchema.parse(createBookingOption())
    const r = BookingOptionCodec.serializeStrict(opt)
    expect(r.ok).toBe(true)
  })

  it('codec.type is literal-narrowed to "BookingOption"', () => {
    expect(BookingOptionCodec.type).toBe('BookingOption')
  })
})
