import type { Codec } from '../shared/codec.js'
import { deserializeLineItemPackage } from './deserialize.js'
import type { JsonLdLineItemPackage, LineItemPackage } from './schema.js'
import { LineItemPackageSchema } from './schema.js'
import { serializeLineItemPackage, serializeLineItemPackageStrict } from './serialize.js'

export const LineItemPackageCodec: Codec<
  LineItemPackage,
  JsonLdLineItemPackage,
  'LineItemPackage'
> = Object.freeze({
  schema: LineItemPackageSchema,
  serialize: serializeLineItemPackage,
  serializeStrict: serializeLineItemPackageStrict,
  deserialize: deserializeLineItemPackage,
  type: 'LineItemPackage',
} as const)
