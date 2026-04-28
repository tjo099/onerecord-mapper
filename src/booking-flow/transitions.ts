// src/booking-flow/transitions.ts
import { randomUUID } from 'node:crypto'
import type { BookingOptionRequest } from '../classes/booking-option-request/schema.js'
import type { BookingOption } from '../classes/booking-option/schema.js'
import type { BookingRequest } from '../classes/booking-request/schema.js'
import type { Booking } from '../classes/booking/schema.js'
import type { SafeIri } from '../iri/strategy.js'
import type { ParseResult } from '../result.js'
import { CARGO_CONTEXT_IRI } from '../version.js'
import { canTransition } from './can-transition.js'

/**
 * v0.2 booking-flow status:
 * - `acceptBookingOptionViaRequest` (below) returns the spec-§5.4
 *   intermediate `BookingOptionRequest` — the spec-correct path.
 * - `acceptBookingOption` (legacy, @deprecated) continues to return
 *   `Booking` directly per spec §5.2 signature; removal v0.3 unless
 *   IATA §5.4 reconciliation restores the §5.2 shortcut.
 *
 * Source-state hardcode: all four BookingOption transition functions
 * (acceptBookingOption, rejectBookingOption, revokeBookingOption,
 * acceptBookingOptionViaRequest) pass the constant `'REQUEST_PENDING'`
 * as the source state to `canTransition` rather than reading
 * `opt.optionStatus`. This is intentional — see deviation #11 in
 * `docs/spec-deviations.md`. The schema's optionStatus enum
 * (OPTION_PROPOSED/_ACCEPTED/_REJECTED) does not align with
 * STATE_DIAGRAM.BookingOption's source-state keys (REQUEST_PENDING).
 * Reading `opt.optionStatus` would make every transition fail.
 * Reconciliation deferred to v0.3.
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

/**
 * Accept a BookingOption per spec §5.4 STATE_DIAGRAM. Returns the
 * intermediate `BookingOptionRequest` resource (not directly a Booking).
 *
 * The carrier-side decision step (BookingOptionRequest.REQUEST_PENDING ->
 * REQUEST_ACCEPTED -> Booking) is modelled separately in v0.3.0. v0.2.0
 * only models the forwarder->carrier request transition.
 *
 * Source-state hardcode: see top-of-file comment + deviation #11.
 */
export function acceptBookingOptionViaRequest(
  opt: BookingOption,
): ParseResult<BookingOptionRequest> {
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
  const req: BookingOptionRequest = {
    '@context': CARGO_CONTEXT_IRI,
    '@type': 'BookingOptionRequest',
    '@id': makeId('BookingOptionRequest'),
    forBookingOption: opt['@id'] as unknown as SafeIri,
    requestStatus: 'REQUEST_PENDING',
  }
  return { ok: true, value: req }
}
