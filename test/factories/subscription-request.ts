import { envelope } from './common.js'

export interface SubscriptionRequestFactoryShape {
  '@context': string
  '@type': 'SubscriptionRequest'
  '@id': string
  subscriber: string
  topic: string
}

export function createSubscriptionRequest(
  overrides: Partial<SubscriptionRequestFactoryShape> = {},
): SubscriptionRequestFactoryShape {
  return {
    ...envelope('SubscriptionRequest'),
    '@type': 'SubscriptionRequest',
    subscriber: 'https://example/organization/subscriber',
    topic: 'https://example/logistics-object/waybill/1',
    ...overrides,
  } as SubscriptionRequestFactoryShape
}
