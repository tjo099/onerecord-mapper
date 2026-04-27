import {
  AccessDelegationCodec,
  AccessDelegationSchema,
  deserializeAccessDelegation,
  serializeAccessDelegation,
  serializeAccessDelegationStrict,
} from '../../../src/classes/access-delegation/index.js'
import { createAccessDelegation } from '../../factories/access-delegation.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'AccessDelegation',
  schema: AccessDelegationSchema,
  serialize: serializeAccessDelegation,
  serializeStrict: serializeAccessDelegationStrict,
  deserialize: deserializeAccessDelegation,
  codec: AccessDelegationCodec,
  factory: createAccessDelegation,
  emptyArrayField: 'permissions',
  invalidIriField: 'delegatedTo',
})
