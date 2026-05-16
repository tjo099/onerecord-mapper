import type { Insurance } from '../../src/classes/insurance/schema.js'
import { envelope } from './common.js'

export type InsuranceFactoryShape = Insurance

export function createInsurance(
  overrides: Partial<InsuranceFactoryShape> = {},
): InsuranceFactoryShape {
  return {
    ...envelope('Insurance'),
    '@type': 'Insurance',
    insuredAmount: { numericalValue: 1000, currencyUnit: 'NOK' },
    ...overrides,
  } as InsuranceFactoryShape
}
