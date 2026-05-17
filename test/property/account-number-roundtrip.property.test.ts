import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import {
  AccountNumberSchema,
  deserializeAccountNumber,
  serializeAccountNumber,
} from '../../src/classes/account-number/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

const accountNumberArb = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('AccountNumber' as const),
  '@id': iriArb('accountnumber'),
  accountNumberType: fc.option(fc.string({ minLength: 1, maxLength: 16 }), { nil: undefined }),
  textualValue: fc.option(fc.string({ minLength: 1, maxLength: 35 }), { nil: undefined }),
})

describe('AccountNumber round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent for any valid AccountNumber', () => {
    roundTripProperty({
      arbitrary: accountNumberArb,
      codec: { serialize: serializeAccountNumber, deserialize: deserializeAccountNumber },
      schema: AccountNumberSchema,
    })
  })
})
