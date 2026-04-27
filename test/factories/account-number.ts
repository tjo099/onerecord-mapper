import type { AccountNumber } from '../../src/classes/account-number/schema.js'
import { envelope } from './common.js'

export type AccountNumberFactoryShape = AccountNumber

export function createAccountNumber(
  overrides: Partial<AccountNumberFactoryShape> = {},
): AccountNumberFactoryShape {
  return {
    ...envelope('AccountNumber'),
    '@type': 'AccountNumber',
    accountNumber: 'ACC-12345',
    accountType: 'INTERNAL',
    ...overrides,
  } as AccountNumberFactoryShape
}
