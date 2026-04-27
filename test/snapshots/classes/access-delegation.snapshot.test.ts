import {
  AccessDelegationSchema,
  serializeAccessDelegation,
} from '../../../src/classes/access-delegation/index.js'
import { createAccessDelegation } from '../../factories/access-delegation.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'AccessDelegation',
  schema: AccessDelegationSchema,
  serialize: serializeAccessDelegation,
  factory: createAccessDelegation,
})
