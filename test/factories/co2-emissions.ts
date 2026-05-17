import type { CO2Emissions } from '../../src/classes/co2-emissions/schema.js'
import { envelope } from './common.js'

export type CO2EmissionsFactoryShape = CO2Emissions

export function createCO2Emissions(
  overrides: Partial<CO2EmissionsFactoryShape> = {},
): CO2EmissionsFactoryShape {
  return {
    ...envelope('CO2Emissions'),
    '@type': 'CO2Emissions',
    calculatedEmissions: { numericalValue: 1234.5, unit: 'KGM' },
    ...overrides,
  } as CO2EmissionsFactoryShape
}
