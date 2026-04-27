import { ShipmentSchema, serializeShipment } from '../../../src/classes/shipment/index.js'
import { createShipment } from '../../factories/shipment.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'Shipment',
  schema: ShipmentSchema,
  serialize: serializeShipment,
  factory: createShipment,
})
