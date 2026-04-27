import {
  SubscriptionRequestCodec,
  SubscriptionRequestSchema,
  deserializeSubscriptionRequest,
  serializeSubscriptionRequest,
  serializeSubscriptionRequestStrict,
} from '../../../src/classes/subscription-request/index.js'
import { createSubscriptionRequest } from '../../factories/subscription-request.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'SubscriptionRequest',
  schema: SubscriptionRequestSchema,
  serialize: serializeSubscriptionRequest,
  serializeStrict: serializeSubscriptionRequestStrict,
  deserialize: deserializeSubscriptionRequest,
  codec: SubscriptionRequestCodec,
  factory: createSubscriptionRequest,
  invalidIriField: 'subscription',
})
