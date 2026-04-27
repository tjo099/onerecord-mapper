import type { Subscription } from '../../src/classes/subscription/schema.js'
import { envelope } from './common.js'

export type SubscriptionFactoryShape = Subscription

export function createSubscription(
  overrides: Partial<SubscriptionFactoryShape> = {},
): SubscriptionFactoryShape {
  return {
    ...envelope('Subscription'),
    '@type': 'Subscription',
    topicType: 'LOGISTICS_OBJECT_TYPE',
    topic: 'https://example.org/topic/waybill',
    subscriber: 'https://example.org/party/123',
    subscribedTo: ['OBJECT_CREATED'],
    notificationEndpoint: 'https://example.org/notify',
    ...overrides,
  } as SubscriptionFactoryShape
}
