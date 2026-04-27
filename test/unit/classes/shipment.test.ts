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
  numericFields: { 'totalGrossWeight.value': 'weight', 'totalVolume.value': 'volume' },
  emptyArrayField: 'containedPieces',
  invalidIriField: 'consignee',
})
