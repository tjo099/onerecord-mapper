import {
  MovementTimeCodec,
  MovementTimeSchema,
  deserializeMovementTime,
  serializeMovementTime,
  serializeMovementTimeStrict,
} from '../../../src/classes/movement-time/index.js'
import { createMovementTime } from '../../factories/movement-time.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'MovementTime',
  schema: MovementTimeSchema,
  serialize: serializeMovementTime,
  serializeStrict: serializeMovementTimeStrict,
  deserialize: deserializeMovementTime,
  codec: MovementTimeCodec,
  factory: createMovementTime,
})
