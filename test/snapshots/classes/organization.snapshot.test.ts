import {
  OrganizationSchema,
  serializeOrganization,
} from '../../../src/classes/organization/index.js'
import { createOrganization } from '../../factories/organization.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'Organization',
  schema: OrganizationSchema,
  serialize: serializeOrganization,
  factory: createOrganization,
})
