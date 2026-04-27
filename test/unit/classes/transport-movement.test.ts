import {
  TransportMovementCodec,
  TransportMovementSchema,
  deserializeTransportMovement,
  serializeTransportMovement,
  serializeTransportMovementStrict,
} from '../../../src/classes/transport-movement/index.js'
import { createTransportMovement } from '../../factories/transport-movement.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'TransportMovement',
  schema: TransportMovementSchema,
  serialize: serializeTransportMovement,
  serializeStrict: serializeTransportMovementStrict,
  deserialize: deserializeTransportMovement,
  codec: TransportMovementCodec,
  factory: createTransportMovement,
  emptyArrayField: 'movementTimes',
  invalidIriField: 'departureLocation',
})
