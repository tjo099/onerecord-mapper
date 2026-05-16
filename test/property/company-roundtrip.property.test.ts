import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import {
  CompanySchema,
  deserializeCompany,
  serializeCompany,
} from '../../src/classes/company/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

const companyArb = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('Company' as const),
  '@id': iriArb('company'),
  name: fc.option(fc.string({ minLength: 1, maxLength: 64 }), { nil: undefined }),
  shortName: fc.option(fc.string({ minLength: 1, maxLength: 64 }), { nil: undefined }),
  iataCargoAgentCode: fc.option(fc.stringMatching(/^[0-9-]{1,7}$/), { nil: undefined }),
  iataCargoAgentLocationIdentifier: fc.option(fc.stringMatching(/^[0-9-]{1,4}$/), {
    nil: undefined,
  }),
  basedAtLocation: fc.option(iriArb('location'), { nil: undefined }),
  contactPersons: fc.option(fc.array(iriArb('person'), { minLength: 1, maxLength: 3 }), {
    nil: undefined,
  }),
  otherIdentifiers: fc.option(
    fc.array(
      fc.record({
        otherIdentifierType: fc.constant('CASS'),
        textualValue: fc.string({ minLength: 1 }),
      }),
      { minLength: 1, maxLength: 3 },
    ),
    { nil: undefined },
  ),
  parentOrganization: fc.option(iriArb('company'), { nil: undefined }),
  subOrganization: fc.option(fc.array(iriArb('company'), { minLength: 1, maxLength: 3 }), {
    nil: undefined,
  }),
})

describe('Company round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent', () => {
    roundTripProperty({
      arbitrary: companyArb,
      codec: { serialize: serializeCompany, deserialize: deserializeCompany },
      schema: CompanySchema,
    })
  })
})
