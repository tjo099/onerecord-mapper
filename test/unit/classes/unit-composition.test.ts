import {
  UnitCompositionCodec,
  UnitCompositionSchema,
  deserializeUnitComposition,
  serializeUnitComposition,
  serializeUnitCompositionStrict,
} from '../../../src/classes/unit-composition/index.js'
import { createUnitComposition } from '../../factories/unit-composition.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'UnitComposition',
  schema: UnitCompositionSchema,
  serialize: serializeUnitComposition,
  serializeStrict: serializeUnitCompositionStrict,
  deserialize: deserializeUnitComposition,
  codec: UnitCompositionCodec,
  factory: createUnitComposition,
  invalidIriField: 'loadingUnit',
})
