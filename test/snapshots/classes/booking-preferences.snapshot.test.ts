import { describe, expect, it } from 'vitest'
import {
  BookingPreferencesSchema,
  serializeBookingPreferences,
} from '../../../src/classes/booking-preferences/index.js'
import { createBookingPreferences } from '../../factories/booking-preferences.js'
import { snapshotFixtureFor } from '../../factories/common.js'

describe('BookingPreferences snapshot', () => {
  it('matches the recorded JSON-LD output (deterministic via snapshotFixtureFor)', async () => {
    const pref = BookingPreferencesSchema.parse(
      snapshotFixtureFor('BookingPreferences', createBookingPreferences),
    )
    const out = serializeBookingPreferences(pref)
    await expect(JSON.stringify(out, null, 2)).toMatchFileSnapshot(
      './booking-preferences.snapshot.json',
    )
  })
})
