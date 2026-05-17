import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import {
  type Waybill,
  WaybillSchema,
  deserializeWaybill,
  serializeWaybill,
} from '../../src/classes/waybill/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { fieldEquivalent } from '../util/field-equivalent.js'
import { iriArb, roundTripProperty } from './_helpers.js'

/**
 * fast-check arbitrary that produces a valid Waybill App object.
 * Constraints from WaybillSchema (1b.8 Path A):
 * - waybillType: 'MASTER' | 'HOUSE' | 'DIRECT'
 * - waybillPrefix: [A-Z0-9]{1,3} (alnum editorial policy; spec maxLength 3)
 * - waybillNumber: [A-Z0-9]+ (spec pattern)
 * - All new spec fields optional
 * - totalGrossWeight + shipmentInformation removed
 */
const currencyValueArb = fc.record({
  numericalValue: fc.float({ noNaN: true, noDefaultInfinity: true }),
  currencyUnit: fc.constant('NOK'),
})

const waybillArb = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('Waybill' as const),
  '@id': fc.uuid().map((u) => `https://test.flaks.example/test-tenant/waybill/${u}`),
  waybillType: fc.constantFrom('MASTER' as const, 'HOUSE' as const, 'DIRECT' as const),
  waybillPrefix: fc.stringMatching(/^[A-Z0-9]{1,3}$/),
  waybillNumber: fc.stringMatching(/^[A-Z0-9]+$/),
  shipment: fc.option(iriArb('shipment'), { nil: undefined }),
  departureLocation: fc.option(iriArb('location'), { nil: undefined }),
  arrivalLocation: fc.option(iriArb('location'), { nil: undefined }),
  involvedParties: fc.option(fc.array(iriArb('party'), { minLength: 1, maxLength: 3 }), {
    nil: undefined,
  }),
  waybillLineItems: fc.option(fc.array(iriArb('waybilllineitem'), { minLength: 1, maxLength: 3 }), {
    nil: undefined,
  }),
  otherCharges: fc.option(fc.array(iriArb('othercharge'), { minLength: 1, maxLength: 3 }), {
    nil: undefined,
  }),
  declaredValueForCarriage: fc.option(currencyValueArb, { nil: undefined }),
  declaredValueForCustoms: fc.option(currencyValueArb, { nil: undefined }),
  destinationCharges: fc.option(fc.array(currencyValueArb, { minLength: 1, maxLength: 3 }), {
    nil: undefined,
  }),
  carrierDeclarationDate: fc.option(
    fc
      .date({
        min: new Date('2000-01-01T00:00:00.000Z'),
        max: new Date('2099-12-31T23:59:59.999Z'),
      })
      .map((d) => d.toISOString()),
    { nil: undefined },
  ),
  carrierDeclarationPlace: fc.option(iriArb('location'), { nil: undefined }),
  carrierDeclarationSignature: fc.option(fc.string({ minLength: 1, maxLength: 256 }), {
    nil: undefined,
  }),
  consignorDeclarationSignature: fc.option(fc.string({ minLength: 1, maxLength: 256 }), {
    nil: undefined,
  }),
  accountingInformation: fc.option(fc.string({ minLength: 1, maxLength: 512 }), { nil: undefined }),
  houseWaybills: fc.option(fc.array(iriArb('waybill'), { minLength: 1, maxLength: 3 }), {
    nil: undefined,
  }),
  masterWaybill: fc.option(iriArb('waybill'), { nil: undefined }),
  shippingRefNo: fc.option(fc.string({ minLength: 1, maxLength: 64 }), { nil: undefined }),
  carrierChargeCode: fc.option(fc.string({ minLength: 1, maxLength: 16 }), { nil: undefined }),
  weightValuationIndicator: fc.option(fc.constantFrom('P' as const, 'C' as const), {
    nil: undefined,
  }),
  otherChargesIndicator: fc.option(fc.constantFrom('P' as const, 'C' as const), { nil: undefined }),
  taxAmount: fc.option(currencyValueArb, { nil: undefined }),
  billingDetails: fc.option(iriArb('billingdetails'), { nil: undefined }),
  referredBookingOption: fc.option(
    fc.uuid().map((u) => `https://test.flaks.example/test-tenant/bookingoption/${u}`),
    { nil: undefined },
  ),
})

describe('Waybill round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent for any valid Waybill', () => {
    roundTripProperty({
      arbitrary: waybillArb,
      codec: { serialize: serializeWaybill, deserialize: deserializeWaybill },
      schema: WaybillSchema,
    })
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
        return fieldEquivalent(r2.value, r1.value, {})
      }),
      { numRuns: 50 },
    )
  })
})
