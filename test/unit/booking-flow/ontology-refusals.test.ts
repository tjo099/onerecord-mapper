import { describe, expect, it } from 'vitest'
import {
  acceptBookingOption,
  acceptBookingOptionViaRequest,
  acceptBookingRequest,
  rejectBookingOption,
  revokeBookingOption,
} from '../../../src/booking-flow/transitions.js'
import type { BookingOption } from '../../../src/classes/booking-option/schema.js'
import type { BookingRequest } from '../../../src/classes/booking-request/schema.js'
import { BookingSchema } from '../../../src/classes/booking/schema.js'
import type { ParseResult } from '../../../src/result.js'
import { envelope } from '../../factories/common.js'
import * as oracle from '../../oracle/v0.5.0/index.js'

const helpers: Record<
  | 'acceptBookingOption'
  | 'rejectBookingOption'
  | 'revokeBookingOption'
  | 'acceptBookingOptionViaRequest',
  (o: BookingOption) => ParseResult<unknown>
> = {
  acceptBookingOption,
  rejectBookingOption,
  revokeBookingOption,
  acceptBookingOptionViaRequest,
}

const oracleHelpers = {
  acceptBookingOption: oracle.acceptBookingOption,
  rejectBookingOption: oracle.rejectBookingOption,
  revokeBookingOption: oracle.revokeBookingOption,
  acceptBookingOptionViaRequest: oracle.acceptBookingOptionViaRequest,
} as unknown as Record<keyof typeof helpers, (o: BookingOption) => ParseResult<unknown>>

const cases = [
  ['acceptBookingOption', 'accept'],
  ['rejectBookingOption', 'reject'],
  ['revokeBookingOption', 'revoke'],
  ['acceptBookingOptionViaRequest', 'accept'],
] as const

const stripId = (v: unknown): unknown => {
  if (typeof v !== 'object' || v === null) return v
  const { '@id': _id, ...rest } = v as Record<string, unknown>
  return rest
}

describe('booking-flow containment (ontology-shaped inputs)', () => {
  it('acceptBookingRequest refuses an absent requestStatus', () => {
    const r = acceptBookingRequest({ ...envelope('BookingRequest') } as BookingRequest)
    expect(r).toStrictEqual({
      ok: false,
      error: {
        kind: 'forbidden_state_transition',
        from: 'BookingRequest.(absent)',
        to: 'accept',
        reason: 'legacy_status_absent',
        path: '$',
      },
    })
  })

  it.each(cases)(
    '%s refuses an ontology-only option (statusBookingOption, no optionStatus)',
    (fn, to) =>
      expect(
        helpers[fn]({
          ...envelope('BookingOption'),
          statusBookingOption: 'BOOKED',
        } as BookingOption),
      ).toStrictEqual({
        ok: false,
        error: {
          kind: 'forbidden_state_transition',
          from: 'BookingOption.BOOKED',
          to,
          reason: 'ontology_status_present',
          path: '$',
        },
      }),
  )

  it.each(cases)(
    '%s refuses an option carrying both statuses (ontology_status_present)',
    (fn, to) =>
      expect(
        helpers[fn]({
          ...envelope('BookingOption'),
          optionStatus: 'OPTION_PROPOSED',
          statusBookingOption: 'BOOKED',
        } as BookingOption),
      ).toStrictEqual({
        ok: false,
        error: {
          kind: 'forbidden_state_transition',
          from: 'BookingOption.BOOKED',
          to,
          reason: 'ontology_status_present',
          path: '$',
        },
      }),
  )

  it.each(cases)('%s refuses an absent optionStatus (legacy_status_absent)', (fn, to) =>
    expect(helpers[fn]({ ...envelope('BookingOption') } as BookingOption)).toStrictEqual({
      ok: false,
      error: {
        kind: 'forbidden_state_transition',
        from: 'BookingOption.(absent)',
        to,
        reason: 'legacy_status_absent',
        path: '$',
      },
    }),
  )

  it('acceptBookingOption omits forBookingRequest when the option has none', () => {
    const r = acceptBookingOption({
      ...envelope('BookingOption'),
      optionStatus: 'OPTION_PROPOSED',
    } as BookingOption)
    expect(r.ok && !('forBookingRequest' in r.value)).toBe(true)
    if (r.ok) expect(BookingSchema.safeParse(r.value).success).toBe(true)
  })

  it.each(cases)(
    '%s: 0.5.0-valid input gives the same output as the 0.5.0 helper (ignoring @id)',
    (fn) => {
      const input = {
        ...envelope('BookingOption'),
        optionStatus: 'OPTION_PROPOSED',
        forBookingRequest: envelope('BookingRequest')['@id'],
      } as unknown as BookingOption
      const now = helpers[fn](input)
      const then = oracleHelpers[fn](input)
      expect(now.ok).toBe(true)
      expect(then.ok).toBe(true)
      if (now.ok && then.ok) expect(stripId(now.value)).toStrictEqual(stripId(then.value))
    },
  )
})
