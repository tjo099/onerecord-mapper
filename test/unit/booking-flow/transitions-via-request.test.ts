import { describe, expect, it } from 'vitest'
import { acceptBookingOptionViaRequest } from '../../../src/booking-flow/index.js'
import type { BookingOptionRequest } from '../../../src/classes/booking-option-request/schema.js'
import type { BookingOption } from '../../../src/classes/booking-option/schema.js'
import { CARGO_CONTEXT_IRI } from '../../../src/version.js'

describe('acceptBookingOptionViaRequest — spec §5.4 intermediate state (T2.2)', () => {
  it('returns BookingOptionRequest (not Booking) when transitioning from BookingOption', () => {
    const opt: BookingOption = {
      '@context': CARGO_CONTEXT_IRI,
      '@type': 'BookingOption',
      '@id': 'https://test.example/test/bookingoption/abc',
      forBookingRequest: 'https://test.example/test/bookingrequest/xyz' as never,
      optionStatus: 'OPTION_PROPOSED',
    }
    const r = acceptBookingOptionViaRequest(opt)
    expect(r.ok).toBe(true)
    if (r.ok) {
      const result: BookingOptionRequest = r.value
      expect(result['@type']).toBe('BookingOptionRequest')
      expect(result['@id']).toMatch(/bookingoptionrequest\//)
      // BookingOptionRequest links back to the BookingOption it was
      // created from (matches spec §5.4 — preserves provenance edge).
      expect(result.forBookingOption as string).toBe(opt['@id'])
      expect(result.requestStatus).toBe('REQUEST_PENDING')
    }
  })

  // Note on the v0.2 source-state hardcode (deviation #11): unlike
  // canTransition's documented contract, this function does NOT read
  // opt.optionStatus to gate the transition — it passes the constant
  // 'REQUEST_PENDING' to canTransition, matching STATE_DIAGRAM's
  // current source-state keys. As a result, every BookingOption
  // (regardless of optionStatus) succeeds. The "reject when from-state
  // is not OPTION_PROPOSED" test from the plan would be unimplementable
  // under Path B and is omitted; the deviation will be exercised when
  // v0.3 reconciles STATE_DIAGRAM keys with the schema.
})
