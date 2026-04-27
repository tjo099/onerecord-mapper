import {
  HandlingServiceCodec,
  HandlingServiceSchema,
  deserializeHandlingService,
  serializeHandlingService,
  serializeHandlingServiceStrict,
} from '../../../src/classes/handling-service/index.js'
import { createHandlingService } from '../../factories/handling-service.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'HandlingService',
  schema: HandlingServiceSchema,
  serialize: serializeHandlingService,
  serializeStrict: serializeHandlingServiceStrict,
  deserialize: deserializeHandlingService,
  codec: HandlingServiceCodec,
  factory: createHandlingService,
  invalidIriField: 'provider',
})
