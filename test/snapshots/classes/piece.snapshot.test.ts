import { PieceSchema, serializePiece } from '../../../src/classes/piece/index.js'
import { createPiece } from '../../factories/piece.js'
import { snapshotHarness } from './_harness.js'

snapshotHarness({
  className: 'Piece',
  schema: PieceSchema,
  serialize: serializePiece,
  factory: createPiece,
})
