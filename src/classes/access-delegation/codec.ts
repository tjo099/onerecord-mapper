import type { Codec } from '../shared/codec.js'
import { deserializeAccessDelegation } from './deserialize.js'
import type { AccessDelegation, JsonLdAccessDelegation } from './schema.js'
import { AccessDelegationSchema } from './schema.js'
import { serializeAccessDelegation, serializeAccessDelegationStrict } from './serialize.js'

export const AccessDelegationCodec: Codec<
  AccessDelegation,
  JsonLdAccessDelegation,
  'AccessDelegation'
> = Object.freeze({
  schema: AccessDelegationSchema,
  serialize: serializeAccessDelegation,
  serializeStrict: serializeAccessDelegationStrict,
  deserialize: deserializeAccessDelegation,
  type: 'AccessDelegation',
} as const)
