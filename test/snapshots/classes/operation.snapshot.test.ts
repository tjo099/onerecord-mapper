import { OperationSchema, serializeOperation } from '../../../src/classes/operation/index.js'
import { createOperation } from '../../factories/operation.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'Operation',
  schema: OperationSchema,
  serialize: serializeOperation,
  factory: createOperation,
})
