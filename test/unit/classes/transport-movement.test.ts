import { describe, expect, it } from 'vitest'
import {
  TransportMovementCodec,
  TransportMovementSchema,
  deserializeTransportMovement,
  serializeTransportMovement,
  serializeTransportMovementStrict,
} from '../../../src/classes/transport-movement/index.js'
import { createTransportMovement } from '../../factories/transport-movement.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'TransportMovement',
  schema: TransportMovementSchema,
  serialize: serializeTransportMovement,
  serializeStrict: serializeTransportMovementStrict,
  deserialize: deserializeTransportMovement,
  codec: TransportMovementCodec,
  factory: createTransportMovement,
  emptyArrayField: 'movementTimes',
  invalidIriField: 'departureLocation',
})

describe('TransportMovement — 6 new emission/fuel/distance fields (Task 1b.12)', () => {
  const base = createTransportMovement()

  it('accepts all 6 new optional fields together', () => {
    const r = TransportMovementSchema.safeParse({
      ...base,
      co2Emissions: 'https://example.org/co2/abc',
      fuelType: 'SAF',
      fuelAmountCalculated: { numericalValue: 500.0, unit: 'KGM' },
      fuelAmountMeasured: { numericalValue: 480.0, unit: 'KGM' },
      distanceCalculated: { numericalValue: 8230.0, unit: 'KMT' },
      distanceMeasured: { numericalValue: 8195.0, unit: 'KMT' },
    })
    expect(r.success).toBe(true)
  })

  it('accepts each new field independently (co2Emissions)', () => {
    const r = TransportMovementSchema.safeParse({
      ...base,
      co2Emissions: 'https://example.org/co2/xyz',
    })
    expect(r.success).toBe(true)
  })

  it('accepts each new field independently (fuelType)', () => {
    const r = TransportMovementSchema.safeParse({ ...base, fuelType: 'JetA1' })
    expect(r.success).toBe(true)
  })

  it('accepts each new field independently (fuelAmountCalculated)', () => {
    const r = TransportMovementSchema.safeParse({
      ...base,
      fuelAmountCalculated: { numericalValue: 100, unit: 'KGM' },
    })
    expect(r.success).toBe(true)
  })

  it('accepts each new field independently (distanceCalculated)', () => {
    const r = TransportMovementSchema.safeParse({
      ...base,
      distanceCalculated: { numericalValue: 100, unit: 'KMT' },
    })
    expect(r.success).toBe(true)
  })

  it('rejects non-spec field co2EmissionInKg via .strict()', () => {
    const r = TransportMovementSchema.safeParse({
      ...base,
      co2EmissionInKg: 1234,
    })
    expect(r.success).toBe(false)
  })

  it('rejects non-spec field greatCircleDistance via .strict()', () => {
    const r = TransportMovementSchema.safeParse({
      ...base,
      greatCircleDistance: 8000,
    })
    expect(r.success).toBe(false)
  })
})
