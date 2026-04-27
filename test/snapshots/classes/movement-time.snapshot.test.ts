import { MovementTimeSchema, serializeMovementTime } from '../../../src/classes/movement-time/index.js'
import { createMovementTime } from '../../factories/movement-time.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'MovementTime',
  schema: MovementTimeSchema,
  serialize: serializeMovementTime,
  factory: createMovementTime,
})
