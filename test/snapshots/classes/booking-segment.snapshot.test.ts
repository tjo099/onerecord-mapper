import { describe, expect, it } from 'vitest'
import {
  BookingSegmentSchema,
  serializeBookingSegment,
} from '../../../src/classes/booking-segment/index.js'
import { createBookingSegment } from '../../factories/booking-segment.js'
import { snapshotFixtureFor } from '../../factories/common.js'

describe('BookingSegment snapshot', () => {
  it('matches the recorded JSON-LD output (deterministic via snapshotFixtureFor)', async () => {
    const seg = BookingSegmentSchema.parse(
      snapshotFixtureFor('BookingSegment', createBookingSegment),
    )
    const out = serializeBookingSegment(seg)
    await expect(JSON.stringify(out, null, 2)).toMatchFileSnapshot(
      './booking-segment.snapshot.json',
    )
  })
})
