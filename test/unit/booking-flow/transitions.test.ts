import { describe, expect, it } from 'vitest'
import { canTransition } from '../../../src/booking-flow/can-transition.js'
import {
  acceptBookingOption,
  acceptBookingRequest,
  revokeBookingOption,
} from '../../../src/booking-flow/transitions.js'
import { BookingOptionSchema } from '../../../src/classes/booking-option/schema.js'
import { BookingRequestSchema } from '../../../src/classes/booking-request/schema.js'
import { createBookingOption } from '../../factories/booking-option.js'
import { createBookingRequest } from '../../factories/booking-request.js'

describe('booking transitions (v3 — A2-M6 no `as never`)', () => {
  it('acceptBookingRequest yields a BookingOption', () => {
    const req = BookingRequestSchema.parse(
      createBookingRequest({ requestStatus: 'REQUEST_PENDING' }),
    )
    const r = acceptBookingRequest(req)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value['@type']).toBe('BookingOption')
  })

  it('acceptBookingOption yields a Booking (deliberate skip of BookingOptionRequest — v3 A3-R2)', () => {
    const opt = BookingOptionSchema.parse(createBookingOption())
    const r = acceptBookingOption(opt)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value['@type']).toBe('Booking')
  })

  it('acceptBookingRequest from terminal state fails as forbidden_state_transition', () => {
    // REQUEST_REJECTED is a terminal state with no accept transition
    const req = BookingRequestSchema.parse(
      createBookingRequest({ requestStatus: 'REQUEST_REJECTED' }),
    )
    const r = acceptBookingRequest(req)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('forbidden_state_transition')
  })

  it('terminal REJECTED status has no transitions via canTransition', () => {
    for (const action of ['accept', 'reject', 'revoke', 'modify'] as const) {
      const t = canTransition('BookingOption', 'REQUEST_REJECTED', action)
      expect(t).toBeNull()
    }
  })

  it('Booking.REQUEST_ACCEPTED has no accept transition', () => {
    expect(canTransition('Booking', 'REQUEST_ACCEPTED', 'accept')).toBeNull()
  })

  it('revokeBookingOption returns ParseResult with OPTION_REJECTED status', () => {
    const opt = BookingOptionSchema.parse(createBookingOption())
    const r = revokeBookingOption(opt)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.optionStatus).toBe('OPTION_REJECTED')
  })
})
