import type { Codec } from '../shared/codec.js'
import { deserializeSubscription } from './deserialize.js'
import type { JsonLdSubscription, Subscription } from './schema.js'
import { SubscriptionSchema } from './schema.js'
import { serializeSubscription, serializeSubscriptionStrict } from './serialize.js'

export const SubscriptionCodec: Codec<Subscription, JsonLdSubscription, 'Subscription'> =
  Object.freeze({
    schema: SubscriptionSchema,
    serialize: serializeSubscription,
    serializeStrict: serializeSubscriptionStrict,
    deserialize: deserializeSubscription,
    type: 'Subscription',
  } as const)
