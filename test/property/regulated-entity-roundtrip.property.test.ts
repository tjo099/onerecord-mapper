import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import {
  RegulatedEntitySchema,
  deserializeRegulatedEntity,
  serializeRegulatedEntity,
} from '../../src/classes/regulated-entity/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

const arbitrary = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('RegulatedEntity' as const),
  '@id': iriArb('regulatedentity'),
  regulatedEntityCategory: fc.option(fc.constantFrom('AO', 'KC', 'RA', 'RC'), { nil: undefined }),
  owningOrganization: fc.option(iriArb('company'), { nil: undefined }),
  regulatedEntityIdentifier: fc.option(fc.string({ minLength: 1, maxLength: 256 }), {
    nil: undefined,
  }),
  regulatedEntityExpiryDate: fc.option(
    fc
      .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
      .map((d) => d.toISOString()),
    { nil: undefined },
  ),
})

describe('RegulatedEntity round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent', () => {
    roundTripProperty({
      arbitrary,
      codec: {
        serialize: serializeRegulatedEntity,
        deserialize: deserializeRegulatedEntity,
      },
      schema: RegulatedEntitySchema,
    })
  })
})
