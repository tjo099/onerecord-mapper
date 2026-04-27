import { LocationSchema, serializeLocation } from '../../../src/classes/location/index.js'
import { createLocation } from '../../factories/location.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'Location',
  schema: LocationSchema,
  serialize: serializeLocation,
  factory: createLocation,
})
