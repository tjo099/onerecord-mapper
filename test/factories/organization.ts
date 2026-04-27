import type { Organization } from '../../src/classes/organization/schema.js'
import { envelope } from './common.js'

export type OrganizationFactoryShape = Organization

export function createOrganization(
  overrides: Partial<OrganizationFactoryShape> = {},
): OrganizationFactoryShape {
  return {
    ...envelope('Organization'),
    '@type': 'Organization',
    organizationName: 'Acme Corp',
    branch: 'HQ',
    ...overrides,
  } as OrganizationFactoryShape
}
