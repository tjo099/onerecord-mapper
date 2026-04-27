import {
  HandlingServiceSchema,
  serializeHandlingService,
} from '../../../src/classes/handling-service/index.js'
import { createHandlingService } from '../../factories/handling-service.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'HandlingService',
  schema: HandlingServiceSchema,
  serialize: serializeHandlingService,
  factory: createHandlingService,
})
