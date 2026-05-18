import type { LoadingMaterial } from '../../src/classes/loading-material/schema.js'
import { envelope } from './common.js'

export function createLoadingMaterial(
  overrides: Partial<LoadingMaterial> = {},
): LoadingMaterial {
  return { ...envelope('LoadingMaterial'), '@type': 'LoadingMaterial', description: 'dry ice', ...overrides } as LoadingMaterial
}
