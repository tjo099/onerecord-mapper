import type { Codec } from '../shared/codec.js'
import { deserializePerson } from './deserialize.js'
import type { JsonLdPerson, Person } from './schema.js'
import { PersonSchema } from './schema.js'
import { serializePerson, serializePersonStrict } from './serialize.js'

export const PersonCodec: Codec<Person, JsonLdPerson, 'Person'> = Object.freeze({
  schema: PersonSchema,
  serialize: serializePerson,
  serializeStrict: serializePersonStrict,
  deserialize: deserializePerson,
  type: 'Person',
} as const)
