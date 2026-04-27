import type { Codec } from '../shared/codec.js'
import { deserializeSubscriptionRequest } from './deserialize.js'
import type { JsonLdSubscriptionRequest, SubscriptionRequest } from './schema.js'
import { SubscriptionRequestSchema } from './schema.js'
import { serializeSubscriptionRequest, serializeSubscriptionRequestStrict } from './serialize.js'

export const SubscriptionRequestCodec: Codec<
  SubscriptionRequest,
  JsonLdSubscriptionRequest,
  'SubscriptionRequest'
> = Object.freeze({
  schema: SubscriptionRequestSchema,
  serialize: serializeSubscriptionRequest,
  serializeStrict: serializeSubscriptionRequestStrict,
  deserialize: deserializeSubscriptionRequest,
  type: 'SubscriptionRequest',
} as const)
