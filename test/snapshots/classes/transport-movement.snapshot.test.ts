import {
  TransportMovementSchema,
  serializeTransportMovement,
} from '../../../src/classes/transport-movement/index.js'
import { createTransportMovement } from '../../factories/transport-movement.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'TransportMovement',
  schema: TransportMovementSchema,
  serialize: serializeTransportMovement,
  factory: createTransportMovement,
})
