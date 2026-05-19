import type { Codec } from '../shared/codec.js'
import { deserializeLoadingMaterial } from './deserialize.js'
import type { JsonLdLoadingMaterial, LoadingMaterial } from './schema.js'
import { LoadingMaterialSchema } from './schema.js'
import { serializeLoadingMaterial, serializeLoadingMaterialStrict } from './serialize.js'

export const LoadingMaterialCodec: Codec<
  LoadingMaterial,
  JsonLdLoadingMaterial,
  'LoadingMaterial'
> = Object.freeze({
  schema: LoadingMaterialSchema,
  serialize: serializeLoadingMaterial,
  serializeStrict: serializeLoadingMaterialStrict,
  deserialize: deserializeLoadingMaterial,
  type: 'LoadingMaterial',
} as const)
