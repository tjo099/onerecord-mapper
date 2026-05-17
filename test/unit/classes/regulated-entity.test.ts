import {
  RegulatedEntityCodec,
  RegulatedEntitySchema,
  deserializeRegulatedEntity,
  serializeRegulatedEntity,
  serializeRegulatedEntityStrict,
} from '../../../src/classes/regulated-entity/index.js'
import { createRegulatedEntity } from '../../factories/regulated-entity.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'RegulatedEntity',
  schema: RegulatedEntitySchema,
  serialize: serializeRegulatedEntity,
  serializeStrict: serializeRegulatedEntityStrict,
  deserialize: deserializeRegulatedEntity,
  codec: RegulatedEntityCodec,
  factory: createRegulatedEntity,
})
