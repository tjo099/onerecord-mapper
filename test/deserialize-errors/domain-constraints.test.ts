import { describe, expect, it } from 'vitest'
import {
  DOMAIN_CONSTRAINTS,
  checkDomainConstraints,
} from '../../src/dispatch/domain-constraints.js'
import { dispatchGraphWalk } from '../../src/dispatch/graph-walk.js'
import { CARGO_CONTEXT_IRI } from '../../src/version.js'

describe('checkDomainConstraints (deviation #6 partial closure, deferral F)', () => {
  it('returns undefined for unknown root class', () => {
    expect(checkDomainConstraints('NotARealClass', {})).toBeUndefined()
  })

  it('returns undefined for Waybill (no active constraints post Path-A)', () => {
    const wb = {
      '@id': 'https://example/wb',
      '@type': 'Waybill',
      // Path A: Waybill.shipmentInformation removed; Waybill.shipment is the
      // spec-correct property. No domain constraint fires for Waybill.
    }
    expect(checkDomainConstraints('Waybill', wb)).toBeUndefined()
  })

  it('returns undefined for Shipment (no active constraints post Path-A)', () => {
    const sh = {
      '@id': 'https://example/sh',
      '@type': 'Shipment',
      // Path A: Shipment.containedPieces removed; Shipment.pieces is the
      // spec-correct property. No domain constraint fires for Shipment.
    }
    expect(checkDomainConstraints('Shipment', sh)).toBeUndefined()
  })

  it('DOMAIN_CONSTRAINTS has no active Waybill or Shipment entries (Path-A cleanup)', () => {
    expect(DOMAIN_CONSTRAINTS.Waybill).toBeUndefined()
    expect(DOMAIN_CONSTRAINTS.Shipment).toBeUndefined()
  })

  it('every constraint that exists references a spec section', () => {
    for (const list of Object.values(DOMAIN_CONSTRAINTS)) {
      for (const c of list) {
        expect(c.specRef).toMatch(/data model|API spec|§/)
      }
    }
  })
})

describe('dispatchGraphWalk -> no domain_constraint_violation for Path-A Waybill/Shipment', () => {
  it('does not emit domain_constraint_violation for Waybill missing shipmentInformation (stale field)', () => {
    const input = {
      '@context': CARGO_CONTEXT_IRI,
      '@id': 'https://example/wb',
      '@type': 'Waybill',
      waybillType: 'MASTER',
      // shipmentInformation is the old (removed) v0.2 field — not a domain constraint
    }
    const r = dispatchGraphWalk(input, 'Waybill')
    // dispatchGraphWalk may still fail for Zod reasons (waybillNumber required, etc.)
    // but it must NOT fail with domain_constraint_violation
    if (!r.ok) {
      expect(r.error.kind).not.toBe('domain_constraint_violation')
    }
  })

  it('does not emit domain_constraint_violation for Shipment with empty pieces array', () => {
    const input = {
      '@context': CARGO_CONTEXT_IRI,
      '@id': 'https://example/sh',
      '@type': 'Shipment',
      pieces: [],
    }
    const r = dispatchGraphWalk(input, 'Shipment')
    if (!r.ok) {
      expect(r.error.kind).not.toBe('domain_constraint_violation')
    }
  })

  it('passes graph-walk for a Waybill with the spec-correct shipment field', () => {
    const input = {
      '@context': CARGO_CONTEXT_IRI,
      '@id': 'https://example/wb',
      '@type': 'Waybill',
      shipment: 'https://example/sh',
    }
    // graph-walk itself should not fire domain_constraint_violation
    const r = dispatchGraphWalk(input, 'Waybill')
    if (!r.ok) {
      expect(r.error.kind).not.toBe('domain_constraint_violation')
    }
  })
})
