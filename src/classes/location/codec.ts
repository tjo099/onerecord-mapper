import type { Codec } from '../shared/codec.js'
import { deserializeLocation } from './deserialize.js'
import type { JsonLdLocation, Location } from './schema.js'
import { LocationSchema } from './schema.js'
import { serializeLocation, serializeLocationStrict } from './serialize.js'

export const LocationCodec: Codec<Location, JsonLdLocation, 'Location'> = Object.freeze({
  schema: LocationSchema,
  serialize: serializeLocation,
  serializeStrict: serializeLocationStrict,
  deserialize: deserializeLocation,
  type: 'Location',
} as const)
