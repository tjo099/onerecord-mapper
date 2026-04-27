import {
  AccountNumberSchema,
  serializeAccountNumber,
} from '../../../src/classes/account-number/index.js'
import { createAccountNumber } from '../../factories/account-number.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'AccountNumber',
  schema: AccountNumberSchema,
  serialize: serializeAccountNumber,
  factory: createAccountNumber,
})
