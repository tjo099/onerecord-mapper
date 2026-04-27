import type { Codec } from '../shared/codec.js'
import { deserializeVerificationRequest } from './deserialize.js'
import type { JsonLdVerificationRequest, VerificationRequest } from './schema.js'
import { VerificationRequestSchema } from './schema.js'
import { serializeVerificationRequest, serializeVerificationRequestStrict } from './serialize.js'

export const VerificationRequestCodec: Codec<
  VerificationRequest,
  JsonLdVerificationRequest,
  'VerificationRequest'
> = Object.freeze({
  schema: VerificationRequestSchema,
  serialize: serializeVerificationRequest,
  serializeStrict: serializeVerificationRequestStrict,
  deserialize: deserializeVerificationRequest,
  type: 'VerificationRequest',
} as const)
