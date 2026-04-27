import { describe, expect, it } from 'vitest'
import {
  BookingShipmentSchema,
  serializeBookingShipment,
} from '../../../src/classes/booking-shipment/index.js'
import { createBookingShipment } from '../../factories/booking-shipment.js'
import { snapshotFixtureFor } from '../../factories/common.js'

describe('BookingShipment snapshot', () => {
  it('matches the recorded JSON-LD output (deterministic via snapshotFixtureFor)', async () => {
    const bs = BookingShipmentSchema.parse(
      snapshotFixtureFor('BookingShipment', createBookingShipment),
    )
    const out = serializeBookingShipment(bs)
    await expect(JSON.stringify(out, null, 2)).toMatchFileSnapshot(
      './booking-shipment.snapshot.json',
    )
  })
})
