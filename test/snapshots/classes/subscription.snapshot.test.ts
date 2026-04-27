import { SubscriptionSchema, serializeSubscription } from '../../../src/classes/subscription/index.js'
import { createSubscription } from '../../factories/subscription.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'Subscription',
  schema: SubscriptionSchema,
  serialize: serializeSubscription,
  factory: createSubscription,
})
