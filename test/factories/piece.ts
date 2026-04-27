import type { Piece } from '../../src/classes/piece/schema.js'
import { envelope } from './common.js'

export type PieceFactoryShape = Piece

export function createPiece(overrides: Partial<PieceFactoryShape> = {}): PieceFactoryShape {
  return {
    ...envelope('Piece'),
    '@type': 'Piece',
    grossWeight: { unit: 'KGM', value: 10 },
    goodsDescription: 'General cargo',
    ...overrides,
  } as PieceFactoryShape
}
