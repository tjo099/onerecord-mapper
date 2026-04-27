import { describe, expect, it } from 'vitest'
import {
  BookingRequestSchema,
  serializeBookingRequest,
} from '../../../src/classes/booking-request/index.js'
import { createBookingRequest } from '../../factories/booking-request.js'
import { snapshotFixtureFor } from '../../factories/common.js'

describe('BookingRequest snapshot', () => {
  it('matches the recorded JSON-LD output (deterministic via snapshotFixtureFor)', async () => {
    const req = BookingRequestSchema.parse(
      snapshotFixtureFor('BookingRequest', createBookingRequest),
    )
    const out = serializeBookingRequest(req)
    await expect(JSON.stringify(out, null, 2)).toMatchFileSnapshot(
      './booking-request.snapshot.json',
    )
  })
})
