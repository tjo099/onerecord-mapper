import { describe, expect, it } from 'vitest'
import {
  BookingOptionRequestSchema,
  serializeBookingOptionRequest,
} from '../../../src/classes/booking-option-request/index.js'
import { createBookingOptionRequest } from '../../factories/booking-option-request.js'
import { snapshotFixtureFor } from '../../factories/common.js'

describe('BookingOptionRequest snapshot', () => {
  it('matches the recorded JSON-LD output (deterministic via snapshotFixtureFor)', async () => {
    const bor = BookingOptionRequestSchema.parse(
      snapshotFixtureFor('BookingOptionRequest', createBookingOptionRequest),
    )
    const out = serializeBookingOptionRequest(bor)
    await expect(JSON.stringify(out, null, 2)).toMatchFileSnapshot(
      './booking-option-request.snapshot.json',
    )
  })
})
