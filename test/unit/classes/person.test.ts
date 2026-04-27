import {
  PersonCodec,
  PersonSchema,
  deserializePerson,
  serializePerson,
  serializePersonStrict,
} from '../../../src/classes/person/index.js'
import { createPerson } from '../../factories/person.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'Person',
  schema: PersonSchema,
  serialize: serializePerson,
  serializeStrict: serializePersonStrict,
  deserialize: deserializePerson,
  codec: PersonCodec,
  factory: createPerson,
})
