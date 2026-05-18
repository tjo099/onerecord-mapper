import type { Composing } from '../../src/classes/composing/schema.js'
import { envelope } from './common.js'

export function createComposing(
  overrides: Partial<Composing> = {},
): Composing {
  return { ...envelope('Composing'), '@type': 'Composing', compositionType: 'COMPOSITION', ...overrides } as Composing
}
