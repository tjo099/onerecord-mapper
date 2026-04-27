import { envelope } from './common.js'

export interface OrganizationFactoryShape {
  '@context': string
  '@type': 'Organization'
  '@id': string
  organizationName: string
  branch?: string
}

export function createOrganization(
  overrides: Partial<OrganizationFactoryShape> = {},
): OrganizationFactoryShape {
  return {
    ...envelope('Organization'),
    '@type': 'Organization',
    organizationName: 'Acme Freight Ltd',
    branch: 'HQ',
    ...overrides,
  } as OrganizationFactoryShape
}
