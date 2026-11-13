import type { Price } from '../../src/classes/price/schema.js'
import { envelope, testIri } from './common.js'

export type PriceFactoryShape = Price

export function createPrice(overrides: Partial<PriceFactoryShape> = {}): PriceFactoryShape {
  return {
    ...envelope('Price'),
    '@type': 'Price',
    chargeCode: 'PP',
    forBookingOption: testIri('BookingOption', '00000000-0000-0000-0000-000000000010'),
    grandTotal: 1250.5,
    ratings: [testIri('Ratings', '00000000-0000-0000-0000-000000000011')],
    ...overrides,
  } as PriceFactoryShape
}
