import { describe, expect, it } from 'vitest'
import { canTransition } from '../../../src/booking-flow/can-transition.js'

describe('canTransition', () => {
  it('returns Transition for BookingRequest.REQUEST_PENDING.accept', () => {
    const t = canTransition('BookingRequest', 'REQUEST_PENDING', 'accept')
    expect(t).not.toBeNull()
    expect(t?.nextType).toBe('BookingOption')
  })

  it('returns null for unknown action', () => {
    expect(canTransition('Booking', 'REQUEST_ACCEPTED', 'accept')).toBeNull()
  })

  it('returns null for unknown status', () => {
    expect(canTransition('BookingRequest', 'BOGUS', 'accept')).toBeNull()
  })
})
