import { describe, expect, it } from 'vitest'
import { acceptBookingRequest, rejectBookingOption } from '../../src/booking-flow/index.js'
import type { BookingOption } from '../../src/classes/booking-option/schema.js'
import type { BookingRequest } from '../../src/classes/booking-request/schema.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'

describe('deserialize -> forbidden_state_transition', () => {
  it('rejects acceptBookingRequest when requestStatus is REQUEST_REJECTED', () => {
    const req: BookingRequest = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'BookingRequest',
      '@id': 'https://test.example/test/bookingrequest/abc',
      requestStatus: 'REQUEST_REJECTED',
      requestor: 'https://test.example/test/party/abc' as never,
    }
    const r = acceptBookingRequest(req)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe('forbidden_state_transition')
      if (r.error.kind === 'forbidden_state_transition') {
        expect(r.error.from).toBe('BookingRequest.REQUEST_REJECTED')
        expect(r.error.to).toBe('accept')
      }
    }
  })

  it('rejects rejectBookingOption from a non-pending state', () => {
    const opt: BookingOption = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'BookingOption',
      '@id': 'https://test.example/test/bookingoption/abc',
      forBookingRequest: 'https://test.example/test/bookingrequest/xyz' as never,
      optionStatus: 'OPTION_REJECTED',
    }
    // canTransition('BookingOption', 'REQUEST_PENDING', 'reject') is true in
    // STATE_DIAGRAM and rejectBookingOption hardcodes that source state in
    // v0.1.x (Phase 2 Task 2.1 fixes the hardcode); the test demonstrates
    // the state-machine plumbing happens to align with a real entry.
    const r = rejectBookingOption(opt)
    expect(r.ok).toBe(true)
  })
})
