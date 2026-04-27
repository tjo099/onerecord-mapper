import { describe, expect, it } from 'vitest'
import { BookingSchema, serializeBooking } from '../../../src/classes/booking/index.js'
import { createBooking } from '../../factories/booking.js'
import { snapshotFixtureFor } from '../../factories/common.js'

describe('Booking snapshot', () => {
  it('matches the recorded JSON-LD output (deterministic via snapshotFixtureFor)', async () => {
    const bk = BookingSchema.parse(snapshotFixtureFor('Booking', createBooking))
    const out = serializeBooking(bk)
    await expect(JSON.stringify(out, null, 2)).toMatchFileSnapshot('./booking.snapshot.json')
  })
})
