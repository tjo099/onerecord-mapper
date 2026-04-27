import { envelope } from './common.js'

export interface PieceFactoryShape {
  '@context': string
  '@type': 'Piece'
  '@id': string
  grossWeight: { unit: 'KGM'; value: number }
  goodsDescription?: string
}

export function createPiece(overrides: Partial<PieceFactoryShape> = {}): PieceFactoryShape {
  return {
    ...envelope('Piece'),
    '@type': 'Piece',
    grossWeight: { unit: 'KGM', value: 10 },
    goodsDescription: 'General cargo',
    ...overrides,
  } as PieceFactoryShape
}
