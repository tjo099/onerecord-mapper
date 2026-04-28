import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import {
  ShipmentSchema,
  deserializeShipment,
  serializeShipment,
} from '../../src/classes/shipment/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty, volumeArb, weightArb } from './_helpers.js'

const shipmentArb = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('Shipment' as const),
  '@id': iriArb('shipment'),
  totalGrossWeight: fc.option(weightArb, { nil: undefined }),
  totalVolume: fc.option(volumeArb, { nil: undefined }),
  pieceCount: fc.integer({ min: 1, max: 10_000 }),
  goodsDescription: fc.option(fc.string({ minLength: 0, maxLength: 1024 }), { nil: undefined }),
  containedPieces: fc.option(fc.array(iriArb('piece'), { maxLength: 50 }), { nil: undefined }),
  consignee: fc.option(iriArb('party'), { nil: undefined }),
  shipper: fc.option(iriArb('party'), { nil: undefined }),
})

describe('Shipment round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent for any valid Shipment', () => {
    roundTripProperty({
      arbitrary: shipmentArb,
      codec: { serialize: serializeShipment, deserialize: deserializeShipment },
      schema: ShipmentSchema,
      numericFields: {
        'totalGrossWeight.value': 'weight',
        'totalVolume.value': 'volume',
      },
    })
  })
})
