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
  accountNumber: fc.string({ minLength: 1, maxLength: 35 }),
  issuedBy: fc.option(iriArb('organization'), { nil: undefined }),
  accountType: fc.option(
    fc.constantFrom('IATA_CASS' as const, 'INTERNAL' as const, 'OTHER' as const),
    { nil: undefined },
  ),
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
