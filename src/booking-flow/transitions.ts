// src/booking-flow/transitions.ts
import { randomUUID } from 'node:crypto'
import type { BookingOptionRequest } from '../classes/booking-option-request/schema.js'
import type { BookingOption } from '../classes/booking-option/schema.js'
import type { BookingRequest } from '../classes/booking-request/schema.js'
import type { Booking } from '../classes/booking/schema.js'
import type { SafeIri } from '../iri/strategy.js'
import type { ParseError, ParseResult } from '../result.js'
import { CARGO_CONTEXT_IRI } from '../version.js'
import { canTransition } from './can-transition.js'
import type { BookingAction } from './state-diagram.js'

/**
 * Legacy pre-ontology booking flow (roles swapped vs ONE Record, deviation
 * #21). These helpers neither read nor write ontology keys: they work only
 * on the legacy `optionStatus` / `requestStatus` state model and refuse
 * ontology-shaped inputs (`statusBookingOption` present, or the legacy
 * status absent) with a `forbidden_state_transition` error carrying a
 * `reason`. Every 0.5.0-valid input behaves exactly as before.
 *
 * Source-state hardcode: the four BookingOption helpers still pass the
 * constant `'REQUEST_PENDING'` to `canTransition` rather than mapping
 * `opt.optionStatus` onto STATE_DIAGRAM keys (deviation #11). They only
 * check that `optionStatus` is present.
 */

const TENANT = 'transitions'
const HOST = 'flaks.example'

function makeId(type: string): string {
  return `https://${HOST}/${TENANT}/${type.toLowerCase()}/${randomUUID()}`
}

function refuseOptionInput(
  opt: BookingOption,
  to: BookingAction,
): { ok: false; error: ParseError } | null {
  if (opt.statusBookingOption !== undefined)
    return {
      ok: false,
      error: {
        kind: 'forbidden_state_transition',
        from: `BookingOption.${opt.statusBookingOption}`,
        to,
        reason: 'ontology_status_present',
        path: '$',
      },
    }
  if (opt.optionStatus === undefined)
    return {
      ok: false,
      error: {
        kind: 'forbidden_state_transition',
        from: 'BookingOption.(absent)',
        to,
        reason: 'legacy_status_absent',
        path: '$',
      },
    }
  return null
}

/**
 * @deprecated Legacy pre-ontology booking flow (roles swapped vs ONE Record, deviation #21). Replacement: booking Path A.
 */
export function acceptBookingRequest(req: BookingRequest): ParseResult<BookingOption> {
  if (req.requestStatus === undefined)
    return {
      ok: false,
      error: {
        kind: 'forbidden_state_transition',
        from: 'BookingRequest.(absent)',
        to: 'accept',
        reason: 'legacy_status_absent',
        path: '$',
      },
    }
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

/**
 * @deprecated Legacy pre-ontology booking flow (roles swapped vs ONE Record, deviation #21). Replacement: booking Path A.
 *
 * (Earlier v0.2 deprecation: skips the intermediate state.)
 *
 * Skips the `BookingOptionRequest` intermediate state per spec §5.4
 * STATE_DIAGRAM. Use `acceptBookingOptionViaRequest(opt)` instead and
 * chain to your persistence layer's BookingOptionRequest -> Booking
 * transition. If the IATA §5.4 reconciliation accepts the §5.2
 * shortcut, this annotation will be relaxed.
 */
export function acceptBookingOption(opt: BookingOption): ParseResult<Booking> {
  const refused = refuseOptionInput(opt, 'accept')
  if (refused) return refused
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
    ...(opt.forBookingRequest !== undefined && { forBookingRequest: opt.forBookingRequest }),
    forBookingOption: opt['@id'] as unknown as SafeIri,
  }
  return { ok: true, value: booking }
}

/**
 * @deprecated Legacy pre-ontology booking flow (roles swapped vs ONE Record, deviation #21). Replacement: booking Path A.
 */
export function rejectBookingOption(
  opt: BookingOption,
  _reason?: string,
): ParseResult<BookingOption> {
  const refused = refuseOptionInput(opt, 'reject')
  if (refused) return refused
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

/**
 * @deprecated Legacy pre-ontology booking flow (roles swapped vs ONE Record, deviation #21). Replacement: booking Path A.
 */
export function revokeBookingOption(
  opt: BookingOption,
  _reason?: string,
): ParseResult<BookingOption> {
  const refused = refuseOptionInput(opt, 'revoke')
  if (refused) return refused
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
 *
 * @deprecated Legacy pre-ontology booking flow (roles swapped vs ONE Record, deviation #21). Replacement: booking Path A.
 */
export function acceptBookingOptionViaRequest(
  opt: BookingOption,
): ParseResult<BookingOptionRequest> {
  const refused = refuseOptionInput(opt, 'accept')
  if (refused) return refused
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
