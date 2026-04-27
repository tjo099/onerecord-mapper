import type { Codec } from '../shared/codec.js'
import { deserializeOrganization } from './deserialize.js'
import type { JsonLdOrganization, Organization } from './schema.js'
import { OrganizationSchema } from './schema.js'
import { serializeOrganization, serializeOrganizationStrict } from './serialize.js'

export const OrganizationCodec: Codec<Organization, JsonLdOrganization, 'Organization'> =
  Object.freeze({
    schema: OrganizationSchema,
    serialize: serializeOrganization,
    serializeStrict: serializeOrganizationStrict,
    deserialize: deserializeOrganization,
    type: 'Organization',
  } as const)
