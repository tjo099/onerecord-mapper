import { PersonSchema, serializePerson } from '../../../src/classes/person/index.js'
import { createPerson } from '../../factories/person.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'Person',
  schema: PersonSchema,
  serialize: serializePerson,
  factory: createPerson,
})
