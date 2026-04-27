import type { Shipment } from '../../src/classes/shipment/schema.js'
import { envelope } from './common.js'

export type ShipmentFactoryShape = Shipment

export function createShipment(
  overrides: Partial<ShipmentFactoryShape> = {},
): ShipmentFactoryShape {
  return {
    ...envelope('Shipment'),
    '@type': 'Shipment',
    totalGrossWeight: { unit: 'KGM', value: 100 },
    pieceCount: 1,
    ...overrides,
  } as ShipmentFactoryShape
}
