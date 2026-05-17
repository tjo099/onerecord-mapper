import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import {
  SecurityDeclarationSchema,
  deserializeSecurityDeclaration,
  serializeSecurityDeclaration,
} from '../../src/classes/security-declaration/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

const arbitrary = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('SecurityDeclaration' as const),
  '@id': iriArb('securitydeclaration'),
  screeningMethods: fc.option(
    fc.array(fc.constantFrom('AOM', 'CMD', 'EDD', 'EDS', 'ETD', 'PHS', 'VCK', 'XRY'), {
      minLength: 1,
    }),
    { nil: undefined },
  ),
  securityStatus: fc.option(fc.constantFrom('NSC', 'SCO', 'SHR', 'SPX'), { nil: undefined }),
  groundsForExemption: fc.option(
    fc.array(fc.constantFrom('BIOM', 'DIPL', 'LFSM', 'MAIL', 'NUCL', 'SMUS', 'TRNS'), {
      minLength: 1,
    }),
    { nil: undefined },
  ),
  additionalSecurityInformation: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  otherScreeningMethods: fc.option(fc.array(fc.string({ minLength: 1 }), { minLength: 1 }), {
    nil: undefined,
  }),
  issuedOn: fc.option(
    fc
      .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
      .map((d) => d.toISOString()),
    { nil: undefined },
  ),
  issuedBy: fc.option(iriArb('person'), { nil: undefined }),
  issuedForPiece: fc.option(fc.array(iriArb('piece'), { minLength: 1 }), { nil: undefined }),
  regulatedEntityIssuer: fc.option(iriArb('regulatedentity'), { nil: undefined }),
  regulatedEntityAcceptor: fc.option(fc.array(iriArb('regulatedentity'), { minLength: 1 }), {
    nil: undefined,
  }),
  receivedFrom: fc.option(iriArb('regulatedentity'), { nil: undefined }),
  otherRegulatedEntities: fc.option(fc.array(iriArb('regulatedentity'), { minLength: 1 }), {
    nil: undefined,
  }),
})

describe('SecurityDeclaration round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent', () => {
    roundTripProperty({
      arbitrary,
      codec: {
        serialize: serializeSecurityDeclaration,
        deserialize: deserializeSecurityDeclaration,
      },
      schema: SecurityDeclarationSchema,
    })
  })
})
