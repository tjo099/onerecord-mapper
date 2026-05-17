import { describe, expect, it } from 'vitest'
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
})

describe('AccountNumber Path A (3.2-rc2 4778-4797)', () => {
  const base = {
    '@context': 'https://onerecord.iata.org/ns/cargo',
    '@type': 'AccountNumber',
    '@id': 'https://t.example/t/accountnumber/1',
  }
  it('uses accountNumberType + textualValue; rejects non-spec accountNumber/issuedBy/accountType', () => {
    expect(
      AccountNumberSchema.safeParse({ ...base, accountNumberType: 'CASS', textualValue: '8112345' })
        .success,
    ).toBe(true)
    for (const k of ['accountNumber', 'issuedBy', 'accountType']) {
      expect(
        AccountNumberSchema.safeParse({
          ...base,
          [k]: k === 'issuedBy' ? 'https://t.example/t/person/1' : 'x',
        }).success,
      ).toBe(false)
    }
  })
})
