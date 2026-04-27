import {
  ChangeCodec,
  ChangeSchema,
  deserializeChange,
  serializeChange,
  serializeChangeStrict,
} from '../../../src/classes/change/index.js'
import { createChange } from '../../factories/change.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'Change',
  schema: ChangeSchema,
  serialize: serializeChange,
  serializeStrict: serializeChangeStrict,
  deserialize: deserializeChange,
  codec: ChangeCodec,
  factory: createChange,
  emptyArrayField: 'hasOperation',
})
