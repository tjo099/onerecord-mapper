import { describe, expect, it } from 'vitest'
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
describe('Piece FWB fidelity', () => {
  it('accepts specialHandlingCodes/otherIdentifiers/ofShipment/securityDeclarations', () => {
    const r = PieceSchema.safeParse({
      '@context': 'https://onerecord.iata.org/ns/cargo',
      '@type': 'Piece',
      '@id': 'https://t.example/t/piece/1',
      grossWeight: { unit: 'KGM', value: 30 },
      specialHandlingCodes: ['PER', 'EAP'],
      otherIdentifiers: [{ otherIdentifierType: 'BARCODE', textualValue: '70190061521001' }],
      ofShipment: 'https://t.example/t/shipment/1',
      containedPieces: ['https://t.example/t/piece/2'],
      upid: 'urn:upid:1',
      packagingType: 'https://t.example/t/x/1',
      securityDeclarations: ['https://t.example/t/securitydeclaration/1'],
    })
    expect(r.success).toBe(true)
  })
})
