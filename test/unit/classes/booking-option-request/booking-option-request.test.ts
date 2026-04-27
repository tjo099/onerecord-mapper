import { describe, expect, it } from 'vitest'
import {
  BookingOptionRequestCodec,
  BookingOptionRequestSchema,
  deserializeBookingOptionRequest,
  serializeBookingOptionRequest,
} from '../../../../src/classes/booking-option-request/index.js'
import { createBookingOptionRequest } from '../../../factories/booking-option-request.js'
import { fieldEquivalent } from '../../../util/field-equivalent.js'

describe('BookingOptionRequest', () => {
  it('round-trips field-equivalent', () => {
    const bor = BookingOptionRequestSchema.parse(createBookingOptionRequest())
    const r = deserializeBookingOptionRequest(serializeBookingOptionRequest(bor))
    expect(r.ok).toBe(true)
    if (r.ok) expect(fieldEquivalent(r.value, bor)).toBe(true)
  })

  it('rejects unknown @context with unknown_context', () => {
    const r = deserializeBookingOptionRequest({
      ...createBookingOptionRequest(),
      '@context': 'https://attacker/x',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('unknown_context')
  })

  it('rejects invalid IRI in forBookingOption with invalid_iri', () => {
    const r = deserializeBookingOptionRequest({
      ...createBookingOptionRequest(),
      forBookingOption: 'not-a-valid-iri',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('invalid_iri')
  })

  it('serializeStrict returns ParseResult', () => {
    const bor = BookingOptionRequestSchema.parse(createBookingOptionRequest())
    const r = BookingOptionRequestCodec.serializeStrict(bor)
    expect(r.ok).toBe(true)
  })

  it('codec.type is literal-narrowed to "BookingOptionRequest"', () => {
    expect(BookingOptionRequestCodec.type).toBe('BookingOptionRequest')
  })
})
