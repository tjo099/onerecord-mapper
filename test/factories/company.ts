import type { Company } from '../../src/classes/company/schema.js'
import { envelope } from './common.js'

export type CompanyFactoryShape = Company

export function createCompany(overrides: Partial<CompanyFactoryShape> = {}): CompanyFactoryShape {
  return {
    ...envelope('Company'),
    '@type': 'Company',
    name: 'Kuehne+Nagel',
    iataCargoAgentCode: '8112345',
    ...overrides,
  } as CompanyFactoryShape
}
