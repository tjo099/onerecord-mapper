import {
  SubscriptionCodec,
  SubscriptionSchema,
  deserializeSubscription,
  serializeSubscription,
  serializeSubscriptionStrict,
} from '../../../src/classes/subscription/index.js'
import { createSubscription } from '../../factories/subscription.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'Subscription',
  schema: SubscriptionSchema,
  serialize: serializeSubscription,
  serializeStrict: serializeSubscriptionStrict,
  deserialize: deserializeSubscription,
  codec: SubscriptionCodec,
  factory: createSubscription,
  emptyArrayField: 'subscribedTo',
  invalidIriField: 'topic',
})
