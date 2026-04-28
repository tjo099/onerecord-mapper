import * as fc from 'fast-check'
import { describe, it } from 'vitest'
import { PersonSchema, deserializePerson, serializePerson } from '../../src/classes/person/index.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'
import { iriArb, roundTripProperty } from './_helpers.js'

// fc.emailAddress() generates RFC-5321-conformant addresses that
// include leading-special-char locals (!a@a.aa) which zod's stricter
// z.string().email() validator rejects. Constrain to a safe subset:
// alphanumeric local + alphanumeric host + .example tld.
const safeIdentArb = fc
  .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')), {
    minLength: 1,
    maxLength: 12,
  })
  .map((chars) => chars.join(''))
const emailArb = fc
  .tuple(safeIdentArb, safeIdentArb)
  .map(([local, host]) => `${local}@${host}.example`)

const personArb = fc.record({
  '@context': fc.constant(CARGO_CONTEXT_IRI),
  '@type': fc.constant('Person' as const),
  '@id': iriArb('person'),
  firstName: fc.string({ minLength: 1, maxLength: 35 }),
  lastName: fc.string({ minLength: 1, maxLength: 35 }),
  salutation: fc.option(fc.string({ minLength: 0, maxLength: 10 }), { nil: undefined }),
  contactPhone: fc.option(fc.string({ minLength: 0, maxLength: 35 }), { nil: undefined }),
  contactEmail: fc.option(emailArb, { nil: undefined }),
})

describe('Person round-trip property (fast-check)', () => {
  it('serialize then deserialize is field-equivalent for any valid Person', () => {
    roundTripProperty({
      arbitrary: personArb,
      codec: { serialize: serializePerson, deserialize: deserializePerson },
      schema: PersonSchema,
    })
  })
})
