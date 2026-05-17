import { ULDSchema, serializeULD } from '../../../src/classes/uld/index.js'
import { createULD } from '../../factories/uld.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'ULD',
  schema: ULDSchema,
  serialize: serializeULD,
  factory: createULD,
})
