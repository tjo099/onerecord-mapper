import type { Codec } from '../shared/codec.js'
import { deserializePiece } from './deserialize.js'
import type { JsonLdPiece, Piece } from './schema.js'
import { PieceSchema } from './schema.js'
import { serializePiece, serializePieceStrict } from './serialize.js'

export const PieceCodec: Codec<Piece, JsonLdPiece, 'Piece'> = Object.freeze({
  schema: PieceSchema,
  serialize: serializePiece,
  serializeStrict: serializePieceStrict,
  deserialize: deserializePiece,
  type: 'Piece',
} as const)
