import { describe, expect, it } from 'vitest'
import {
  BookingTimesSchema,
  serializeBookingTimes,
} from '../../../src/classes/booking-times/index.js'
import { createBookingTimes } from '../../factories/booking-times.js'
import { snapshotFixtureFor } from '../../factories/common.js'

describe('BookingTimes snapshot', () => {
  it('matches the recorded JSON-LD output (deterministic via snapshotFixtureFor)', async () => {
    const bt = BookingTimesSchema.parse(snapshotFixtureFor('BookingTimes', createBookingTimes))
    const out = serializeBookingTimes(bt)
    await expect(JSON.stringify(out, null, 2)).toMatchFileSnapshot('./booking-times.snapshot.json')
  })
})
