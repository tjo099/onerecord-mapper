import {
  ULDCodec,
  ULDSchema,
  deserializeULD,
  serializeULD,
  serializeULDStrict,
} from '../../../src/classes/uld/index.js'
import { createULD } from '../../factories/uld.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'ULD',
  schema: ULDSchema,
  serialize: serializeULD,
  serializeStrict: serializeULDStrict,
  deserialize: deserializeULD,
  codec: ULDCodec,
  factory: createULD,
})
