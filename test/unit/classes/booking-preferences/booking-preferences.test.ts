import { describe, expect, it } from 'vitest'
import {
  BookingPreferencesCodec,
  BookingPreferencesSchema,
  deserializeBookingPreferences,
  serializeBookingPreferences,
} from '../../../../src/classes/booking-preferences/index.js'
import { createBookingPreferences } from '../../../factories/booking-preferences.js'
import { fieldEquivalent } from '../../../util/field-equivalent.js'

describe('BookingPreferences', () => {
  it('round-trips field-equivalent', () => {
    const pref = BookingPreferencesSchema.parse(createBookingPreferences())
    const r = deserializeBookingPreferences(serializeBookingPreferences(pref))
    expect(r.ok).toBe(true)
    if (r.ok) expect(fieldEquivalent(r.value, pref)).toBe(true)
  })

  it('rejects unknown @context with unknown_context', () => {
    const r = deserializeBookingPreferences({
      ...createBookingPreferences(),
      '@context': 'https://attacker/x',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('unknown_context')
  })

  it('serializeStrict returns ParseResult', () => {
    const pref = BookingPreferencesSchema.parse(createBookingPreferences())
    const r = BookingPreferencesCodec.serializeStrict(pref)
    expect(r.ok).toBe(true)
  })

  it('codec.type is literal-narrowed to "BookingPreferences"', () => {
    expect(BookingPreferencesCodec.type).toBe('BookingPreferences')
  })
})
