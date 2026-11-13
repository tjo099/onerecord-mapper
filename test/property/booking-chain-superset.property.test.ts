import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import {
  BookingOptionSchema,
  serializeBookingOption,
} from '../../src/classes/booking-option/index.js'
import {
  BookingRequestSchema,
  serializeBookingRequest,
} from '../../src/classes/booking-request/index.js'
import { BookingSchema, serializeBooking } from '../../src/classes/booking/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import {
  BookingOptionSchema as BookingOptionSchema05,
  BookingRequestSchema as BookingRequestSchema05,
  BookingSchema as BookingSchema05,
  serializeBooking as serializeBooking05,
  serializeBookingOption as serializeBookingOption05,
  serializeBookingRequest as serializeBookingRequest05,
} from '../oracle/v0.5.0/index.js'
import { iriArb } from './_helpers.js'

const RUNS = 200
const MIN_PRESENT = 20

const contextArb = fc.oneof(fc.constant(CARGO_CONTEXT_IRI), fc.constant([CARGO_CONTEXT_IRI]))

/** Reference IRI: canonical, or with a non-canonical host (normalised by safeIri). */
const refIriArb = (kind: string): fc.Arbitrary<string> =>
  fc.oneof(
    { weight: 3, arbitrary: iriArb(kind) },
    fc.uuid().map((u) => `https://1R.Example.com/Test/${kind}/${u}`),
    fc.constant('https://1R.Example.com'),
  )

/** Offset datetimes with Z, +02:00, and fractional-second variants. */
const dateTimeArb = fc
  .tuple(
    fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31'), noInvalidDate: true }),
    fc.constantFrom('Z', '+02:00', '-05:30'),
    fc.constantFrom('', '.5', '.123', '.123456'),
  )
  .map(([d, zone, frac]) => `${d.toISOString().slice(0, 19)}${frac}${zone}`)

const opt = <T>(a: fc.Arbitrary<T>): fc.Arbitrary<T | undefined> => fc.option(a, { nil: undefined })

function strip(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(input)) if (v !== undefined) out[k] = v
  return out
}

interface Spec {
  name: string
  arbitrary: fc.Arbitrary<Record<string, unknown>>
  optionalKeys: string[]
  s05: { safeParse: (x: unknown) => { success: boolean }; parse: (x: unknown) => unknown }
  s06: { safeParse: (x: unknown) => { success: boolean }; parse: (x: unknown) => unknown }
  ser05: (x: never) => unknown
  ser06: (x: never) => unknown
}

const specs: Spec[] = [
  {
    name: 'Booking',
    arbitrary: fc.record({
      '@context': contextArb,
      '@type': fc.constant('Booking'),
      '@id': iriArb('booking'),
      bookingStatus: fc.constantFrom('REQUEST_ACCEPTED', 'REQUEST_REVOKED'),
      forBookingRequest: refIriArb('bookingrequest'),
      forBookingOption: opt(refIriArb('bookingoption')),
    }),
    optionalKeys: ['forBookingOption'],
    s05: BookingSchema05,
    s06: BookingSchema,
    ser05: serializeBooking05 as (x: never) => unknown,
    ser06: serializeBooking as (x: never) => unknown,
  },
  {
    name: 'BookingOption',
    arbitrary: fc.record({
      '@context': contextArb,
      '@type': fc.constant('BookingOption'),
      '@id': iriArb('bookingoption'),
      forBookingRequest: refIriArb('bookingrequest'),
      optionStatus: fc.constantFrom('OPTION_PROPOSED', 'OPTION_ACCEPTED', 'OPTION_REJECTED'),
      expiresAt: opt(dateTimeArb),
      preferences: opt(refIriArb('preferences')),
    }),
    optionalKeys: ['expiresAt', 'preferences'],
    s05: BookingOptionSchema05,
    s06: BookingOptionSchema,
    ser05: serializeBookingOption05 as (x: never) => unknown,
    ser06: serializeBookingOption as (x: never) => unknown,
  },
  {
    name: 'BookingRequest',
    arbitrary: fc.record({
      '@context': contextArb,
      '@type': fc.constant('BookingRequest'),
      '@id': iriArb('bookingrequest'),
      requestStatus: fc.constantFrom(
        'REQUEST_PENDING',
        'REQUEST_ACCEPTED',
        'REQUEST_REJECTED',
        'REQUEST_REVOKED',
      ),
      requestor: refIriArb('requestor'),
      preferences: opt(refIriArb('preferences')),
    }),
    optionalKeys: ['preferences'],
    s05: BookingRequestSchema05,
    s06: BookingRequestSchema,
    ser05: serializeBookingRequest05 as (x: never) => unknown,
    ser06: serializeBookingRequest as (x: never) => unknown,
  },
]

describe('booking chain: 0.5.0 superset and mixed-fleet properties', () => {
  for (const spec of specs) {
    it(`${spec.name}: 0.6.0 parses 0.5.0 payloads identically and serializes byte-identically`, () => {
      const present: Record<string, number> = Object.fromEntries(
        spec.optionalKeys.map((k) => [k, 0]),
      )
      fc.assert(
        fc.property(spec.arbitrary, (raw) => {
          const x = strip(raw)
          for (const k of spec.optionalKeys) if (k in x) present[k] = (present[k] ?? 0) + 1

          // Guard (not a filter): the generator must be valid 0.5.0 input.
          expect(spec.s05.safeParse(x).success).toBe(true)
          // G4a: superset.
          expect(spec.s06.safeParse(x).success).toBe(true)

          const p05 = spec.s05.parse(x) as Record<string, unknown>
          const p06 = spec.s06.parse(x) as Record<string, unknown>
          expect(p06).toEqual(p05)
          expect(Object.keys(p06)).toEqual(Object.keys(p05))

          // Mixed fleet (Review Focus 1): byte-identical wire output.
          expect(JSON.stringify(spec.ser06(p06 as never))).toBe(
            JSON.stringify(spec.ser05(p05 as never)),
          )
        }),
        { numRuns: RUNS },
      )
      for (const k of spec.optionalKeys) {
        expect(present[k], `${spec.name}.${k} presence`).toBeGreaterThanOrEqual(MIN_PRESENT)
      }
    })
  }
})
