import { LoadingMaterialSchema, serializeLoadingMaterial } from '../../../src/classes/loading-material/index.js'
import { createLoadingMaterial } from '../../factories/loading-material.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'LoadingMaterial',
  schema: LoadingMaterialSchema,
  serialize: serializeLoadingMaterial,
  factory: createLoadingMaterial,
})
