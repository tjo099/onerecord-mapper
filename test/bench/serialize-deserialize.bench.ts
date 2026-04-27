import { bench, describe } from 'vitest'
import { PieceSchema, deserializePiece, serializePiece } from '../../src/classes/piece/index.js'
import {
  ShipmentSchema,
  deserializeShipment,
  serializeShipment,
} from '../../src/classes/shipment/index.js'
import {
  WaybillSchema,
  deserializeWaybill,
  serializeWaybill,
} from '../../src/classes/waybill/index.js'
import { createPiece } from '../factories/piece.js'
import { createShipment } from '../factories/shipment.js'
import { createWaybill } from '../factories/waybill.js'

const wb = WaybillSchema.parse(createWaybill())
const wire = serializeWaybill(wb)
const sh = ShipmentSchema.parse(createShipment())
const shWire = serializeShipment(sh)
const pc = PieceSchema.parse(createPiece())
const pcWire = serializePiece(pc)

describe('serialize bench (Ring 1)', () => {
  bench('serializeWaybill', () => {
    serializeWaybill(wb)
  })
  bench('serializeShipment', () => {
    serializeShipment(sh)
  })
  bench('serializePiece', () => {
    serializePiece(pc)
  })
})

describe('deserialize bench (Ring 1)', () => {
  bench('deserializeWaybill', () => {
    deserializeWaybill(wire)
  })
  bench('deserializeShipment', () => {
    deserializeShipment(shWire)
  })
  bench('deserializePiece', () => {
    deserializePiece(pcWire)
  })
})

describe('round-trip bench (Ring 1)', () => {
  bench('Waybill: serialize + deserialize', () => {
    deserializeWaybill(serializeWaybill(wb))
  })
  bench('Shipment: serialize + deserialize', () => {
    deserializeShipment(serializeShipment(sh))
  })
  bench('Piece: serialize + deserialize', () => {
    deserializePiece(serializePiece(pc))
  })
})
