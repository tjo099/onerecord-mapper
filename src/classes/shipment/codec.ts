import type { Codec } from '../shared/codec.js'
import { deserializeShipment } from './deserialize.js'
import type { JsonLdShipment, Shipment } from './schema.js'
import { ShipmentSchema } from './schema.js'
import { serializeShipment, serializeShipmentStrict } from './serialize.js'

export const ShipmentCodec: Codec<Shipment, JsonLdShipment, 'Shipment'> = Object.freeze({
  schema: ShipmentSchema,
  serialize: serializeShipment,
  serializeStrict: serializeShipmentStrict,
  deserialize: deserializeShipment,
  type: 'Shipment',
} as const)
