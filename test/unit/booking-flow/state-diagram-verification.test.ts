import { describe, expect, it } from 'vitest'
import { STATE_DIAGRAM } from '../../../src/booking-flow/state-diagram.js'

describe('STATE_DIAGRAM coverage (T63 verification)', () => {
  it('BookingRequest has accept/reject/revoke from REQUEST_PENDING', () => {
    const cell = STATE_DIAGRAM.BookingRequest?.REQUEST_PENDING
    expect(cell?.accept).toBeDefined()
    expect(cell?.reject).toBeDefined()
    expect(cell?.revoke).toBeDefined()
  })

  it('BookingOption has all 4 actions from REQUEST_PENDING', () => {
    const cell = STATE_DIAGRAM.BookingOption?.REQUEST_PENDING
    expect(cell?.accept).toBeDefined()
    expect(cell?.reject).toBeDefined()
    expect(cell?.revoke).toBeDefined()
    expect(cell?.modify).toBeDefined()
  })

  it('terminal states (REJECTED, REVOKED) have no further transitions', () => {
    expect(STATE_DIAGRAM.BookingRequest?.REQUEST_REJECTED).toBeUndefined()
    expect(STATE_DIAGRAM.BookingRequest?.REQUEST_REVOKED).toBeUndefined()
  })

  it('BookingOptionRequest has accept/reject/revoke/modify from REQUEST_PENDING', () => {
    const cell = STATE_DIAGRAM.BookingOptionRequest?.REQUEST_PENDING
    expect(cell?.accept).toBeDefined()
    expect(cell?.reject).toBeDefined()
    expect(cell?.revoke).toBeDefined()
    expect(cell?.modify).toBeDefined()
  })

  it('Booking.REQUEST_ACCEPTED has only revoke', () => {
    const cell = STATE_DIAGRAM.Booking?.REQUEST_ACCEPTED
    expect(cell?.revoke).toBeDefined()
    expect(cell?.accept).toBeUndefined()
    expect(cell?.reject).toBeUndefined()
    expect(cell?.modify).toBeUndefined()
  })

  it('STATE_DIAGRAM is deeply frozen', () => {
    expect(Object.isFrozen(STATE_DIAGRAM)).toBe(true)
    const cell = STATE_DIAGRAM.BookingRequest?.REQUEST_PENDING?.accept
    if (cell) expect(Object.isFrozen(cell)).toBe(true)
  })
})
