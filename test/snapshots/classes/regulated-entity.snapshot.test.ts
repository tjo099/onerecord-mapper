import { RegulatedEntitySchema, serializeRegulatedEntity } from '../../../src/classes/regulated-entity/index.js'
import { createRegulatedEntity } from '../../factories/regulated-entity.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'RegulatedEntity',
  schema: RegulatedEntitySchema,
  serialize: serializeRegulatedEntity,
  factory: createRegulatedEntity,
})
