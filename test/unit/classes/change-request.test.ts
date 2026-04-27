import {
  ChangeRequestCodec,
  ChangeRequestSchema,
  deserializeChangeRequest,
  serializeChangeRequest,
  serializeChangeRequestStrict,
} from '../../../src/classes/change-request/index.js'
import { createChangeRequest } from '../../factories/change-request.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'ChangeRequest',
  schema: ChangeRequestSchema,
  serialize: serializeChangeRequest,
  serializeStrict: serializeChangeRequestStrict,
  deserialize: deserializeChangeRequest,
  codec: ChangeRequestCodec,
  factory: createChangeRequest,
  invalidIriField: 'forLogisticsObject',
})
