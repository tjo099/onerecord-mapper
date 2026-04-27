import { describe, expect, it } from 'vitest'
import {
  BookingOptionSchema,
  serializeBookingOption,
} from '../../../src/classes/booking-option/index.js'
import { createBookingOption } from '../../factories/booking-option.js'
import { snapshotFixtureFor } from '../../factories/common.js'

describe('BookingOption snapshot', () => {
  it('matches the recorded JSON-LD output (deterministic via snapshotFixtureFor)', async () => {
    const opt = BookingOptionSchema.parse(snapshotFixtureFor('BookingOption', createBookingOption))
    const out = serializeBookingOption(opt)
    await expect(JSON.stringify(out, null, 2)).toMatchFileSnapshot('./booking-option.snapshot.json')
  })
})
