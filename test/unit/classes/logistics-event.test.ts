import {
  LogisticsEventCodec,
  LogisticsEventSchema,
  deserializeLogisticsEvent,
  serializeLogisticsEvent,
  serializeLogisticsEventStrict,
} from '../../../src/classes/logistics-event/index.js'
import { createLogisticsEvent } from '../../factories/logistics-event.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'LogisticsEvent',
  schema: LogisticsEventSchema,
  serialize: serializeLogisticsEvent,
  serializeStrict: serializeLogisticsEventStrict,
  deserialize: deserializeLogisticsEvent,
  codec: LogisticsEventCodec,
  factory: createLogisticsEvent,
  invalidIriField: 'eventLocation',
})
