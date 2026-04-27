import {
  AccessDelegationRequestSchema,
  serializeAccessDelegationRequest,
} from '../../../src/classes/access-delegation-request/index.js'
import { createAccessDelegationRequest } from '../../factories/access-delegation-request.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'AccessDelegationRequest',
  schema: AccessDelegationRequestSchema,
  serialize: serializeAccessDelegationRequest,
  factory: createAccessDelegationRequest,
})
