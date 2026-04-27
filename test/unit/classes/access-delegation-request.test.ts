import {
  AccessDelegationRequestCodec,
  AccessDelegationRequestSchema,
  deserializeAccessDelegationRequest,
  serializeAccessDelegationRequest,
  serializeAccessDelegationRequestStrict,
} from '../../../src/classes/access-delegation-request/index.js'
import { createAccessDelegationRequest } from '../../factories/access-delegation-request.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'AccessDelegationRequest',
  schema: AccessDelegationRequestSchema,
  serialize: serializeAccessDelegationRequest,
  serializeStrict: serializeAccessDelegationRequestStrict,
  deserialize: deserializeAccessDelegationRequest,
  codec: AccessDelegationRequestCodec,
  factory: createAccessDelegationRequest,
  invalidIriField: 'accessDelegation',
})
