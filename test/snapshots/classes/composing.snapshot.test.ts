import { ComposingSchema, serializeComposing } from '../../../src/classes/composing/index.js'
import { createComposing } from '../../factories/composing.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'Composing',
  schema: ComposingSchema,
  serialize: serializeComposing,
  factory: createComposing,
})
