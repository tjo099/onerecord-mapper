import {
  LogisticsEventSchema,
  serializeLogisticsEvent,
} from '../../../src/classes/logistics-event/index.js'
import { createLogisticsEvent } from '../../factories/logistics-event.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'LogisticsEvent',
  schema: LogisticsEventSchema,
  serialize: serializeLogisticsEvent,
  factory: createLogisticsEvent,
})
