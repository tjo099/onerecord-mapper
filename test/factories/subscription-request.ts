import type { SubscriptionRequest } from '../../src/classes/subscription-request/schema.js'
import { envelope } from './common.js'

export type SubscriptionRequestFactoryShape = SubscriptionRequest

export function createSubscriptionRequest(
  overrides: Partial<SubscriptionRequestFactoryShape> = {},
): SubscriptionRequestFactoryShape {
  return {
    ...envelope('SubscriptionRequest'),
    '@type': 'SubscriptionRequest',
    requestStatus: 'REQUEST_PENDING',
    subscription: 'https://example.org/subscription/123',
    ...overrides,
  } as SubscriptionRequestFactoryShape
}
