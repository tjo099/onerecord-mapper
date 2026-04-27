import {
  SubscriptionRequestSchema,
  serializeSubscriptionRequest,
} from '../../../src/classes/subscription-request/index.js'
import { createSubscriptionRequest } from '../../factories/subscription-request.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'SubscriptionRequest',
  schema: SubscriptionRequestSchema,
  serialize: serializeSubscriptionRequest,
  factory: createSubscriptionRequest,
})
