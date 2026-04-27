import {
  AccountNumberCodec,
  AccountNumberSchema,
  deserializeAccountNumber,
  serializeAccountNumber,
  serializeAccountNumberStrict,
} from '../../../src/classes/account-number/index.js'
import { createAccountNumber } from '../../factories/account-number.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'AccountNumber',
  schema: AccountNumberSchema,
  serialize: serializeAccountNumber,
  serializeStrict: serializeAccountNumberStrict,
  deserialize: deserializeAccountNumber,
  codec: AccountNumberCodec,
  factory: createAccountNumber,
  invalidIriField: 'issuedBy',
})
