import { TransportLegsSchema, serializeTransportLegs } from '../../../src/classes/transport-legs/index.js'
import { createTransportLegs } from '../../factories/transport-legs.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'TransportLegs',
  schema: TransportLegsSchema,
  serialize: serializeTransportLegs,
  factory: createTransportLegs,
})
