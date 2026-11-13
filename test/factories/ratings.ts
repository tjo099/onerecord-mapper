import type { Ratings } from '../../src/classes/ratings/schema.js'
import { envelope, testIri } from './common.js'

export type RatingsFactoryShape = Ratings

export function createRatings(overrides: Partial<RatingsFactoryShape> = {}): RatingsFactoryShape {
  return {
    ...envelope('Ratings'),
    '@type': 'Ratings',
    billingChargeIdentifier: 'WT',
    chargePaymentType: 'P',
    subTotal: 1000,
    forPrices: [testIri('Price', '00000000-0000-0000-0000-000000000012')],
    ...overrides,
  } as RatingsFactoryShape
}
