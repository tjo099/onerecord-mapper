import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import {
  ShipmentSchema,
  deserializeShipment,
  serializeShipment,
} from '../../src/classes/shipment/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty, weightArb } from './_helpers.js'

const shipmentArb = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('Shipment' as const),
  '@id': iriArb('shipment'),
  totalGrossWeight: fc.option(weightArb, { nil: undefined }),
  goodsDescription: fc.option(fc.string({ minLength: 0, maxLength: 1024 }), { nil: undefined }),
  totalDimensions: fc.option(
    fc.record({
      length: fc.record({
        numericalValue: fc.float({ noNaN: true, noDefaultInfinity: true }),
        unit: fc.constant('CMT'),
      }),
    }),
    { nil: undefined },
  ),
  pieces: fc.option(fc.array(iriArb('piece'), { minLength: 1, maxLength: 3 }), {
    nil: undefined,
  }),
  waybill: fc.option(iriArb('waybill'), { nil: undefined }),
  involvedParties: fc.option(fc.array(iriArb('party'), { minLength: 1, maxLength: 3 }), {
    nil: undefined,
  }),
  customsInformation: fc.option(
    fc.array(iriArb('customsinformation'), { minLength: 1, maxLength: 3 }),
    { nil: undefined },
  ),
  insurance: fc.option(iriArb('insurance'), { nil: undefined }),
  textualHandlingInstructions: fc.option(
    fc.array(fc.string({ minLength: 1, maxLength: 1024 }), { minLength: 1, maxLength: 3 }),
    { nil: undefined },
  ),
  incoterms: fc.option(fc.string({ minLength: 1, maxLength: 8 }), { nil: undefined }),
})

describe('Shipment round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent for any valid Shipment', () => {
    roundTripProperty({
      arbitrary: shipmentArb,
      codec: { serialize: serializeShipment, deserialize: deserializeShipment },
      schema: ShipmentSchema,
      numericFields: {
        'totalGrossWeight.value': 'weight',
      },
    })
  })
})
