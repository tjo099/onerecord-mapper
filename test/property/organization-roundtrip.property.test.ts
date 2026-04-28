import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import {
  OrganizationSchema,
  deserializeOrganization,
  serializeOrganization,
} from '../../src/classes/organization/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

const organizationArb = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('Organization' as const),
  '@id': iriArb('organization'),
  organizationName: fc.string({ minLength: 1, maxLength: 70 }),
  branch: fc.option(fc.string({ minLength: 0, maxLength: 35 }), { nil: undefined }),
  address: fc.option(iriArb('address'), { nil: undefined }),
  contactPersons: fc.option(fc.array(iriArb('person'), { maxLength: 20 }), { nil: undefined }),
})

describe('Organization round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent for any valid Organization', () => {
    roundTripProperty({
      arbitrary: organizationArb,
      codec: { serialize: serializeOrganization, deserialize: deserializeOrganization },
      schema: OrganizationSchema,
    })
  })
})
