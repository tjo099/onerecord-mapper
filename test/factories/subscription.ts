import { envelope } from './common.js'

export interface SubscriptionFactoryShape {
  '@context': string
  '@type': 'Subscription'
  '@id': string
  topicType: 'LOGISTICS_OBJECT_CREATED' | 'LOGISTICS_OBJECT_UPDATED' | 'LOGISTICS_OBJECT_LIFECYCLE'
  subscribedTo: string
}

export function createSubscription(
  overrides: Partial<SubscriptionFactoryShape> = {},
): SubscriptionFactoryShape {
  return {
    ...envelope('Subscription'),
    '@type': 'Subscription',
    topicType: 'LOGISTICS_OBJECT_UPDATED',
    subscribedTo: 'https://example/logistics-object/waybill/1',
    ...overrides,
  } as SubscriptionFactoryShape
}
