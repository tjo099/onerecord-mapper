import { roundTripHarness } from './_harness.js'
import { ComposingCodec, ComposingSchema, deserializeComposing, serializeComposing, serializeComposingStrict } from '../../../src/classes/composing/index.js'
import { createComposing } from '../../factories/composing.js'

roundTripHarness({
  className: 'Composing',
  schema: ComposingSchema,
  serialize: serializeComposing,
  serializeStrict: serializeComposingStrict,
  deserialize: deserializeComposing,
  codec: ComposingCodec,
  factory: createComposing,
  invalidIriField: 'loadingUnit',
})
