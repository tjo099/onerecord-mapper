import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import {
  type Waybill,
  WaybillSchema,
  deserializeWaybill,
  serializeWaybill,
} from '../../src/classes/waybill/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { fieldEquivalent } from '../util/field-equivalent.js'

/**
 * fast-check arbitrary that produces a valid Waybill App object.
 * Constraints from WaybillSchema:
 * - waybillType: 'MASTER' | 'HOUSE'
 * - waybillPrefix: 3-digit string
 * - waybillNumber: 8-digit string
 * - totalGrossWeight: optional KGM weight, value >= 0
 * - shipmentInformation: optional safeIri (https URL)
 * - referredBookingOption: optional safeIri (https URL)
 */
const waybillArb = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('Waybill' as const),
  '@id': fc.uuid().map((u) => `https://test.flaks.example/test-tenant/waybill/${u}`),
  waybillType: fc.constantFrom('MASTER' as const, 'HOUSE' as const),
  waybillPrefix: fc.integer({ min: 100, max: 999 }).map((n) => String(n)),
  waybillNumber: fc.integer({ min: 10000000, max: 99999999 }).map((n) => String(n)),
  totalGrossWeight: fc.option(
    fc.record({
      unit: fc.constant('KGM' as const),
      value: fc.float({ min: 0, max: 1000000, noNaN: true, noDefaultInfinity: true }),
    }),
    { nil: undefined },
  ),
  shipmentInformation: fc.option(
    fc.uuid().map((u) => `https://test.flaks.example/test-tenant/shipment/${u}`),
    { nil: undefined },
  ),
  referredBookingOption: fc.option(
    fc.uuid().map((u) => `https://test.flaks.example/test-tenant/bookingoption/${u}`),
    { nil: undefined },
  ),
})

describe('Waybill round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent for any valid Waybill', () => {
    fc.assert(
      fc.property(waybillArb, (input) => {
        // Strip undefined keys so exactOptionalPropertyTypes is happy
        const cleaned: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(input)) {
          if (v !== undefined) cleaned[k] = v
        }
        const wb = WaybillSchema.parse(cleaned) as Waybill
        const wire = serializeWaybill(wb)
        const r = deserializeWaybill(wire)
        if (!r.ok) return false
        return fieldEquivalent(r.value, wb, {
          numericFields: { 'totalGrossWeight.value': 'weight' },
        })
      }),
      { numRuns: 100 },
    )
  })

  it('serialize is deterministic — same input produces same wire output', () => {
    fc.assert(
      fc.property(waybillArb, (input) => {
        const cleaned: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(input)) {
          if (v !== undefined) cleaned[k] = v
        }
        const wb = WaybillSchema.parse(cleaned) as Waybill
        const wire1 = serializeWaybill(wb)
        const wire2 = serializeWaybill(wb)
        return JSON.stringify(wire1) === JSON.stringify(wire2)
      }),
      { numRuns: 100 },
    )
  })

  it('deserialize is idempotent — deserialize(deserialize(x)) is field-equivalent to deserialize(x)', () => {
    fc.assert(
      fc.property(waybillArb, (input) => {
        const cleaned: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(input)) {
          if (v !== undefined) cleaned[k] = v
        }
        const wb = WaybillSchema.parse(cleaned) as Waybill
        const wire = serializeWaybill(wb)
        const r1 = deserializeWaybill(wire)
        if (!r1.ok) return false
        const r2 = deserializeWaybill(serializeWaybill(r1.value))
        if (!r2.ok) return false
        return fieldEquivalent(r2.value, r1.value, {
          numericFields: { 'totalGrossWeight.value': 'weight' },
        })
      }),
      { numRuns: 50 },
    )
  })
})
