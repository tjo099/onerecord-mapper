import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import {
  WaybillLineItemSchema,
  deserializeWaybillLineItem,
  serializeWaybillLineItem,
} from '../../src/classes/waybill-line-item/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

const waybillLineItemArb = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('WaybillLineItem' as const),
  '@id': iriArb('waybilllineitem'),
  lineItemNumber: fc.option(fc.nat(), { nil: undefined }),
  rateGrossWeight: fc.option(
    fc.record({
      numericalValue: fc.float({ noNaN: true, noDefaultInfinity: true }),
      unit: fc.constant('KGM'),
    }),
    { nil: undefined },
  ),
  chargeableWeight: fc.option(
    fc.record({
      numericalValue: fc.float({ noNaN: true, noDefaultInfinity: true }),
      unit: fc.constant('KGM'),
    }),
    { nil: undefined },
  ),
  rateVolume: fc.option(
    fc.record({
      numericalValue: fc.float({ noNaN: true, noDefaultInfinity: true }),
      unit: fc.constant('KGM'),
    }),
    { nil: undefined },
  ),
  ratePercentage: fc.option(
    fc.record({
      numericalValue: fc.float({ noNaN: true, noDefaultInfinity: true }),
      unit: fc.constant('KGM'),
    }),
    { nil: undefined },
  ),
  rateCharge: fc.option(
    fc.record({
      numericalValue: fc.float({ noNaN: true, noDefaultInfinity: true }),
      currencyUnit: fc.constant('NOK'),
    }),
    { nil: undefined },
  ),
  rateClassCode: fc.option(fc.constantFrom('Q', 'M', 'N'), { nil: undefined }),
  rateClassCodeBasic: fc.option(fc.constantFrom('Q', 'M', 'N'), { nil: undefined }),
  rcp: fc.option(fc.constantFrom('Q', 'M', 'N'), { nil: undefined }),
  uldRateClassType: fc.option(fc.constantFrom('Q', 'M', 'N'), { nil: undefined }),
  rateSlac: fc.option(fc.nat(), { nil: undefined }),
  conversionFactor: fc.option(fc.float({ noNaN: true, noDefaultInfinity: true }), {
    nil: undefined,
  }),
  lineItemPackages: fc.option(fc.array(iriArb('lineitempackage'), { minLength: 1, maxLength: 3 }), {
    nil: undefined,
  }),
  uldReferences: fc.option(fc.array(iriArb('uld'), { minLength: 1, maxLength: 3 }), {
    nil: undefined,
  }),
})

describe('WaybillLineItem round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent', () => {
    roundTripProperty({
      arbitrary: waybillLineItemArb,
      codec: { serialize: serializeWaybillLineItem, deserialize: deserializeWaybillLineItem },
      schema: WaybillLineItemSchema,
    })
  })
})
