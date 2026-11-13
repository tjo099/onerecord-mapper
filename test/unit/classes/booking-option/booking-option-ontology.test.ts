import { describe, expect, it } from 'vitest'
import {
  BookingOptionSchema,
  deserializeBookingOption,
} from '../../../../src/classes/booking-option/index.js'
import { createBookingOption } from '../../../factories/booking-option.js'
import { envelope } from '../../../factories/common.js'
import { BookingOptionSchema as S05 } from '../../../oracle/v0.5.0/index.js'

const IRI = (s: string) => `https://1r.example.com/logistics-objects/${s}`

function zodIssue(r: ReturnType<typeof deserializeBookingOption>) {
  expect(r.ok).toBe(false)
  if (!r.ok && r.error.kind === 'zod_validation') return r.error.issues[0]
  return expect.unreachable('expected zod_validation')
}

describe('BookingOption ontology realignment', () => {
  it('G4a: 0.5.0 values parse identically (values and key order)', () => {
    for (const x of [
      createBookingOption(),
      createBookingOption({ expiresAt: '2026-12-01T00:00:00+01:00' }),
    ]) {
      expect(BookingOptionSchema.parse(x)).toEqual(S05.parse(x))
      expect(Object.keys(BookingOptionSchema.parse(x))).toEqual(Object.keys(S05.parse(x)))
    }
  })

  it('G4b: the P7 ontology-only shape parses', () => {
    const r = deserializeBookingOption({
      ...envelope('BookingOption'),
      forBookingRequest: IRI('br'),
      statusBookingOption: 'BOOKED',
      price: IRI('price'),
      unitsPreference: { currency: 'NOK' },
      offerValidTo: '2026-12-01T00:00:00+01:00',
      transportLegs: [IRI('tl1')],
      carrierProduct: { productCode: 'GEN' },
      bookingTimes: { latestAcceptanceTime: '2026-11-20T08:00:00Z', totalTransitTime: 'PT14H' },
      stationRemarks: [{ station: IRI('osl'), remarksText: 'ULD build-up at OSL' }],
    })
    expect(r.ok).toBe(true)
  })

  it('G4b: envelope-only BookingOption parses', () => {
    expect(deserializeBookingOption({ ...envelope('BookingOption') }).ok).toBe(true)
  })

  it('G4c: optionStatus + statusBookingOption parse together', () => {
    const r = deserializeBookingOption({
      ...envelope('BookingOption'),
      optionStatus: 'OPTION_PROPOSED',
      statusBookingOption: 'BOOKABLE',
    })
    expect(r.ok).toBe(true)
  })

  it('G4d: skeletonIndicator → zod_validation, code unrecognized_keys', () => {
    const issue = zodIssue(
      deserializeBookingOption({ ...envelope('BookingOption'), skeletonIndicator: true }),
    )
    expect(issue?.code).toBe('unrecognized_keys')
  })

  it("statusBookingOption 'OPTION_PROPOSED' → zod_validation at statusBookingOption", () => {
    const issue = zodIssue(
      deserializeBookingOption({
        ...envelope('BookingOption'),
        statusBookingOption: 'OPTION_PROPOSED',
      }),
    )
    expect(issue?.path).toBe('statusBookingOption')
  })

  it("optionStatus 'BOOKED' → zod_validation at optionStatus", () => {
    const issue = zodIssue(
      deserializeBookingOption({ ...envelope('BookingOption'), optionStatus: 'BOOKED' }),
    )
    expect(issue?.path).toBe('optionStatus')
  })

  it.each(['2026-12-01T00:00:00Z', '2026-12-01T00:00:00+02:00'])(
    'offerValidTo %s accepted',
    (v) => {
      expect(deserializeBookingOption({ ...envelope('BookingOption'), offerValidTo: v }).ok).toBe(
        true,
      )
    },
  )

  it('offerValidTo without timezone → zod_validation at offerValidTo', () => {
    const issue = zodIssue(
      deserializeBookingOption({
        ...envelope('BookingOption'),
        offerValidTo: '2026-12-01T00:00:00',
      }),
    )
    expect(issue?.path).toBe('offerValidTo')
  })

  it('stationRemarks[0].station non-https IRI → invalid_iri', () => {
    const r = deserializeBookingOption({
      ...envelope('BookingOption'),
      stationRemarks: [{ station: 'http://attacker.example/x' }],
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('invalid_iri')
  })

  it("unitsPreference with '@type': 'Value' → zod_validation at unitsPreference.@type", () => {
    const issue = zodIssue(
      deserializeBookingOption({
        ...envelope('BookingOption'),
        unitsPreference: { '@type': 'Value', currency: 'NOK' },
      }),
    )
    expect(issue?.path).toBe('unitsPreference.@type')
  })
})
