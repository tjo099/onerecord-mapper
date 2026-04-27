import {
  PieceCodec,
  PieceSchema,
  deserializePiece,
  serializePiece,
  serializePieceStrict,
} from '../../../src/classes/piece/index.js'
import { createPiece } from '../../factories/piece.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'Piece',
  schema: PieceSchema,
  serialize: serializePiece,
  serializeStrict: serializePieceStrict,
  deserialize: deserializePiece,
  codec: PieceCodec,
  factory: createPiece,
  numericFields: { 'grossWeight.value': 'weight' },
})
