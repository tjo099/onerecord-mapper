// test/unit/types/types-barrel.test.ts
//
// TypeScript-level test: verifies the types barrel exports the expected type
// names and contributes zero runtime symbols (pure type imports).
import { describe, expect, it } from 'vitest'

// If any of these import lines fail the TS compiler, the type barrel is broken.
import type {
  ClassName,
  Codec,
  DeserializeOpts,
  IriParts,
  IriStrategy,
  JsonLd,
  JsonLdShipment,
  JsonLdWaybill,
  LogisticsObject,
  ParseError,
  ParseResult,
  PublicParseError,
  SafeIri,
  SafetyLimits,
  SerializeOpts,
  Shipment,
  Waybill,
} from '../../../src/types/index.js'

// Runtime guard: the types barrel must export zero runtime values.
// Import as value namespace to check.
import * as TypesBarrel from '../../../src/types/index.js'

describe('types barrel — zero runtime + type completeness', () => {
  it('exports zero runtime values (pure type barrel)', () => {
    const keys = Object.keys(TypesBarrel)
    expect(keys).toHaveLength(0)
  })

  it('ParseResult type is structurally usable — ok variant', () => {
    const r: ParseResult<number> = { ok: true, value: 42 }
    expect(r.ok).toBe(true)
  })

  it('ParseResult type is structurally usable — error variant', () => {
    const e: ParseError = { kind: 'missing_type', path: '$' }
    const r: ParseResult<never> = { ok: false, error: e }
    expect(r.ok).toBe(false)
  })

  it('PublicParseError only exposes kind + optional path', () => {
    const p: PublicParseError = { kind: 'invalid_iri' }
    expect(p.kind).toBe('invalid_iri')
  })

  it('Waybill type is structurally usable', () => {
    const w: Waybill = {
      '@context': 'https://onerecord.iata.org/ns/cargo',
      '@type': 'Waybill',
      '@id': 'https://example.com/waybills/1',
      waybillType: 'MASTER',
      waybillPrefix: '020',
      waybillNumber: '12345678',
    }
    expect(w['@type']).toBe('Waybill')
  })

  // Phantom type usage — just verifying the types compile without TS errors.
  it('type aliases resolve without TS errors (phantom check)', () => {
    // These are compile-time checks; the runtime assertion is trivially true.
    const _c: ClassName = 'Waybill'
    const _ok: boolean = true
    expect(_ok).toBe(true)
  })
})
