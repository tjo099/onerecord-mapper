import { ChangeSchema, serializeChange } from '../../../src/classes/change/index.js'
import { createChange } from '../../factories/change.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'Change',
  schema: ChangeSchema,
  serialize: serializeChange,
  factory: createChange,
})
