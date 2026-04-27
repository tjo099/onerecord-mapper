import {
  ChangeRequestSchema,
  serializeChangeRequest,
} from '../../../src/classes/change-request/index.js'
import { createChangeRequest } from '../../factories/change-request.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'ChangeRequest',
  schema: ChangeRequestSchema,
  serialize: serializeChangeRequest,
  factory: createChangeRequest,
})
