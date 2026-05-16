import { describe, expect, it } from 'vitest'
import {
  ShipmentCodec,
  ShipmentSchema,
  deserializeShipment,
  serializeShipment,
  serializeShipmentStrict,
} from '../../../src/classes/shipment/index.js'
import { createShipment } from '../../factories/shipment.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'Shipment',
  schema: ShipmentSchema,
  serialize: serializeShipment,
  serializeStrict: serializeShipmentStrict,
  deserialize: deserializeShipment,
  codec: ShipmentCodec,
  factory: createShipment,
  numericFields: { 'totalGrossWeight.value': 'weight' },
  emptyArrayField: 'pieces',
  invalidIriField: 'waybill',
})

describe('Shipment Path A spec-correctness', () => {
  it('rejects removed non-spec keys, accepts spec keys', () => {
    const base = {
      '@context': 'https://onerecord.iata.org/ns/cargo',
      '@type': 'Shipment',
      '@id': 'https://t.example/t/shipment/1',
    }
    for (const k of ['pieceCount', 'totalVolume', 'containedPieces', 'shipper', 'consignee']) {
      expect(
        ShipmentSchema.safeParse({
          ...base,
          [k]: k === 'pieceCount' ? 1 : 'https://t.example/t/x/1',
        }).success,
      ).toBe(false)
    }
    expect(
      ShipmentSchema.safeParse({
        ...base,
        pieces: ['https://t.example/t/piece/1'],
        waybill: 'https://t.example/t/waybill/1',
        involvedParties: ['https://t.example/t/party/1'],
        customsInformation: ['https://t.example/t/customsinformation/1'],
        insurance: 'https://t.example/t/insurance/1',
        textualHandlingInstructions: ['Keep dry'],
        totalDimensions: { length: { numericalValue: 80, unit: 'CMT' } },
        securityDeclarations: ['https://t.example/t/securitydeclaration/1'],
        totalGrossWeight: { unit: 'KGM', value: 120 },
      }).success,
    ).toBe(true)
  })
})
