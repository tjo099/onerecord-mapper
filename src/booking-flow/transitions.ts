// src/booking-flow/transitions.ts
import { randomUUID } from 'node:crypto'
import type { BookingOption } from '../classes/booking-option/schema.js'
import type { BookingRequest } from '../classes/booking-request/schema.js'
import type { Booking } from '../classes/booking/schema.js'
import type { SafeIri } from '../iri/strategy.js'
import type { ParseResult } from '../result.js'
import { CARGO_CONTEXT_IRI } from '../version.js'
import { canTransition } from './can-transition.js'

/**
 * v3 (A3-R2 top-risk #2): acceptBookingOption DELIBERATELY skips the
 * BookingOptionRequest intermediate and returns a Booking directly. This
 * contradicts spec §5.4 STATE_DIAGRAM (which routes BookingOption.accept ->
 * BookingOptionRequest), but matches spec §5.2 signature. Documented as a
 * deliberate divergence; v0.2 will reconcile.
 */

const TENANT = 'transitions'
const HOST = 'flaks.example'

function makeId(type: string): string {
  return `https://${HOST}/${TENANT}/${type.toLowerCase()}/${randomUUID()}`
}

export function acceptBookingRequest(req: BookingRequest): ParseResult<BookingOption> {
  const t = canTransition('BookingRequest', req.requestStatus, 'accept')
  if (!t)
    return {
      ok: false,
      error: {
        kind: 'forbidden_state_transition',
        from: `BookingRequest.${req.requestStatus}`,
        to: 'accept',
        path: '$',
      },
    }
  const opt: BookingOption = {
    '@context': CARGO_CONTEXT_IRI,
    '@type': 'BookingOption',
    '@id': makeId('BookingOption'),
    forBookingRequest: req['@id'] as unknown as SafeIri,
    optionStatus: 'OPTION_PROPOSED',
  }
  return { ok: true, value: opt }
}

export function acceptBookingOption(opt: BookingOption): ParseResult<Booking> {
  const t = canTransition('BookingOption', 'REQUEST_PENDING', 'accept')
  if (!t)
    return {
      ok: false,
      error: {
        kind: 'forbidden_state_transition',
        from: 'BookingOption.REQUEST_PENDING',
        to: 'accept',
        path: '$',
      },
    }
  const booking: Booking = {
    '@context': CARGO_CONTEXT_IRI,
    '@type': 'Booking',
    '@id': makeId('Booking'),
    bookingStatus: 'REQUEST_ACCEPTED',
    forBookingRequest: opt.forBookingRequest,
    forBookingOption: opt['@id'] as unknown as SafeIri,
  }
  return { ok: true, value: booking }
}

export function rejectBookingOption(
  opt: BookingOption,
  _reason?: string,
): ParseResult<BookingOption> {
  const t = canTransition('BookingOption', 'REQUEST_PENDING', 'reject')
  if (!t)
    return {
      ok: false,
      error: {
        kind: 'forbidden_state_transition',
        from: 'BookingOption.REQUEST_PENDING',
        to: 'reject',
        path: '$',
      },
    }
  return {
    ok: true,
    value: {
      ...opt,
      optionStatus: 'OPTION_REJECTED',
    },
  }
}

export function revokeBookingOption(
  opt: BookingOption,
  _reason?: string,
): ParseResult<BookingOption> {
  const t = canTransition('BookingOption', 'REQUEST_PENDING', 'revoke')
  if (!t)
    return {
      ok: false,
      error: {
        kind: 'forbidden_state_transition',
        from: 'BookingOption.REQUEST_PENDING',
        to: 'revoke',
        path: '$',
      },
    }
  return { ok: true, value: { ...opt, optionStatus: 'OPTION_REJECTED' } }
}
