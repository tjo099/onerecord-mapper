import { roundTripHarness } from './_harness.js'
import { LoadingMaterialCodec, LoadingMaterialSchema, deserializeLoadingMaterial, serializeLoadingMaterial, serializeLoadingMaterialStrict } from '../../../src/classes/loading-material/index.js'
import { createLoadingMaterial } from '../../factories/loading-material.js'

roundTripHarness({
  className: 'LoadingMaterial',
  schema: LoadingMaterialSchema,
  serialize: serializeLoadingMaterial,
  serializeStrict: serializeLoadingMaterialStrict,
  deserialize: deserializeLoadingMaterial,
  codec: LoadingMaterialCodec,
  factory: createLoadingMaterial,
  invalidIriField: 'manufacturer',
})
