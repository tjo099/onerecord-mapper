import { envelope } from './common.js'

export interface AccountNumberFactoryShape {
  '@context': string
  '@type': 'AccountNumber'
  '@id': string
  accountNumber: string
  accountType?: 'IATA_CASS' | 'INTERNAL' | 'OTHER'
}

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
