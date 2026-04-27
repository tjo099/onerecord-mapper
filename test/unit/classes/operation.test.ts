import {
  OperationCodec,
  OperationSchema,
  deserializeOperation,
  serializeOperation,
  serializeOperationStrict,
} from '../../../src/classes/operation/index.js'
import { createOperation } from '../../factories/operation.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'Operation',
  schema: OperationSchema,
  serialize: serializeOperation,
  serializeStrict: serializeOperationStrict,
  deserialize: deserializeOperation,
  codec: OperationCodec,
  factory: createOperation,
})
