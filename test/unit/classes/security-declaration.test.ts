import { describe, expect, it } from 'vitest'
import {
  SecurityDeclarationCodec,
  SecurityDeclarationSchema,
  deserializeSecurityDeclaration,
  serializeSecurityDeclaration,
  serializeSecurityDeclarationStrict,
} from '../../../src/classes/security-declaration/index.js'
import { createSecurityDeclaration } from '../../factories/security-declaration.js'
import { roundTripHarness } from './_harness.js'

roundTripHarness({
  className: 'SecurityDeclaration',
  schema: SecurityDeclarationSchema,
  serialize: serializeSecurityDeclaration,
  serializeStrict: serializeSecurityDeclarationStrict,
  deserialize: deserializeSecurityDeclaration,
  codec: SecurityDeclarationCodec,
  factory: createSecurityDeclaration,
})

describe('SecurityDeclaration 3.2-rc2 12-prop set', () => {
  const base = {
    '@context': 'https://onerecord.iata.org/ns/cargo',
    '@type': 'SecurityDeclaration',
    '@id': 'https://t.example/t/securitydeclaration/1',
  }
  it('accepts the verified properties incl. long strings (no invented caps)', () => {
    expect(
      SecurityDeclarationSchema.safeParse({
        ...base,
        securityStatus: 'SPX',
        screeningMethods: ['XRY'],
        groundsForExemption: ['MAIL'],
        additionalSecurityInformation: 'x'.repeat(5000),
        issuedOn: '2026-04-30T08:00:00.000Z',
        issuedBy: 'https://t.example/t/person/1',
        issuedForPiece: ['https://t.example/t/piece/1'],
        regulatedEntityIssuer: 'https://t.example/t/regulatedentity/1',
      }).success,
    ).toBe(true)
  })
  it('rejects 3.2.1-master-only issuedForShipment', () => {
    expect(
      SecurityDeclarationSchema.safeParse({
        ...base,
        issuedForShipment: 'https://t.example/t/shipment/1',
      }).success,
    ).toBe(false)
  })
})
