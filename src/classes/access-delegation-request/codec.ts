import type { Codec } from '../shared/codec.js'
import { deserializeAccessDelegationRequest } from './deserialize.js'
import type { AccessDelegationRequest, JsonLdAccessDelegationRequest } from './schema.js'
import { AccessDelegationRequestSchema } from './schema.js'
import {
  serializeAccessDelegationRequest,
  serializeAccessDelegationRequestStrict,
} from './serialize.js'

export const AccessDelegationRequestCodec: Codec<
  AccessDelegationRequest,
  JsonLdAccessDelegationRequest,
  'AccessDelegationRequest'
> = Object.freeze({
  schema: AccessDelegationRequestSchema,
  serialize: serializeAccessDelegationRequest,
  serializeStrict: serializeAccessDelegationRequestStrict,
  deserialize: deserializeAccessDelegationRequest,
  type: 'AccessDelegationRequest',
} as const)
