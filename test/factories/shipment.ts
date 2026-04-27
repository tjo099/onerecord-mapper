import { envelope } from './common.js'

export interface ShipmentFactoryShape {
  '@context': string
  '@type': 'Shipment'
  '@id': string
  totalGrossWeight?: { unit: 'KGM'; value: number }
  pieceCount?: number
}

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
