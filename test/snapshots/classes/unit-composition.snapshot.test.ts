import { UnitCompositionSchema, serializeUnitComposition } from '../../../src/classes/unit-composition/index.js'
import { createUnitComposition } from '../../factories/unit-composition.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'UnitComposition',
  schema: UnitCompositionSchema,
  serialize: serializeUnitComposition,
  factory: createUnitComposition,
})
