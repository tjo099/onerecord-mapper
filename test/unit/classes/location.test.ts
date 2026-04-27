import {
  LocationCodec,
  LocationSchema,
  deserializeLocation,
  serializeLocation,
  serializeLocationStrict,
} from '../../../src/classes/location/index.js'
import { createLocation } from '../../factories/location.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'Location',
  schema: LocationSchema,
  serialize: serializeLocation,
  serializeStrict: serializeLocationStrict,
  deserialize: deserializeLocation,
  codec: LocationCodec,
  factory: createLocation,
  invalidIriField: 'address',
})
