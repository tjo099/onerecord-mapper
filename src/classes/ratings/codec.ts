import type { Codec } from '../shared/codec.js'
import { deserializeRatings } from './deserialize.js'
import type { JsonLdRatings, Ratings } from './schema.js'
import { RatingsSchema } from './schema.js'
import { serializeRatings, serializeRatingsStrict } from './serialize.js'

export const RatingsCodec: Codec<Ratings, JsonLdRatings, 'Ratings'> = Object.freeze({
  schema: RatingsSchema,
  serialize: serializeRatings,
  serializeStrict: serializeRatingsStrict,
  deserialize: deserializeRatings,
  type: 'Ratings',
} as const)
