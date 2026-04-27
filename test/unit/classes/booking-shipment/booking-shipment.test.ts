import { describe, expect, it } from 'vitest'
import {
  BookingShipmentCodec,
  BookingShipmentSchema,
  deserializeBookingShipment,
  serializeBookingShipment,
} from '../../../../src/classes/booking-shipment/index.js'
import { createBookingShipment } from '../../../factories/booking-shipment.js'
import { fieldEquivalent } from '../../../util/field-equivalent.js'

describe('BookingShipment', () => {
  it('round-trips field-equivalent', () => {
    const bs = BookingShipmentSchema.parse(createBookingShipment())
    const r = deserializeBookingShipment(serializeBookingShipment(bs))
    expect(r.ok).toBe(true)
    if (r.ok) expect(fieldEquivalent(r.value, bs)).toBe(true)
  })

  it('rejects unknown @context with unknown_context', () => {
    const r = deserializeBookingShipment({
      ...createBookingShipment(),
      '@context': 'https://attacker/x',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('unknown_context')
  })

  it('rejects invalid IRI in forShipment with invalid_iri', () => {
    const r = deserializeBookingShipment({
      ...createBookingShipment(),
      forShipment: 'not-a-valid-iri',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('invalid_iri')
  })

  it('serializeStrict returns ParseResult', () => {
    const bs = BookingShipmentSchema.parse(createBookingShipment())
    const r = BookingShipmentCodec.serializeStrict(bs)
    expect(r.ok).toBe(true)
  })

  it('codec.type is literal-narrowed to "BookingShipment"', () => {
    expect(BookingShipmentCodec.type).toBe('BookingShipment')
  })
})
