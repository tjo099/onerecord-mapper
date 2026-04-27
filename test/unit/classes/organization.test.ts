import {
  OrganizationCodec,
  OrganizationSchema,
  deserializeOrganization,
  serializeOrganization,
  serializeOrganizationStrict,
} from '../../../src/classes/organization/index.js'
import { createOrganization } from '../../factories/organization.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'Organization',
  schema: OrganizationSchema,
  serialize: serializeOrganization,
  serializeStrict: serializeOrganizationStrict,
  deserialize: deserializeOrganization,
  codec: OrganizationCodec,
  factory: createOrganization,
  emptyArrayField: 'contactPersons',
  invalidIriField: 'address',
})
