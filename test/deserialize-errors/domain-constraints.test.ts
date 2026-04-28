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

  it('returns undefined when all required Waybill fields are present', () => {
    const wb = {
      '@id': 'https://example/wb',
      '@type': 'Waybill',
      shipmentInformation: 'https://example/sh',
    }
    expect(checkDomainConstraints('Waybill', wb)).toBeUndefined()
  })

  it('detects missing Waybill.shipmentInformation', () => {
    const wb = { '@id': 'https://example/wb', '@type': 'Waybill' }
    const v = checkDomainConstraints('Waybill', wb)
    expect(v).toBeDefined()
    expect(v?.className).toBe('Waybill')
    expect(v?.field).toBe('shipmentInformation')
    expect(v?.expected).toBe('required')
  })

  it('treats null as missing', () => {
    const wb = {
      '@id': 'https://example/wb',
      '@type': 'Waybill',
      shipmentInformation: null,
    }
    const v = checkDomainConstraints('Waybill', wb)
    expect(v).toBeDefined()
  })

  it('treats empty array as missing for Shipment.containedPieces', () => {
    const sh = {
      '@id': 'https://example/sh',
      '@type': 'Shipment',
      containedPieces: [],
    }
    const v = checkDomainConstraints('Shipment', sh)
    expect(v).toBeDefined()
    expect(v?.field).toBe('containedPieces')
  })

  it('every constraint references a spec section', () => {
    for (const list of Object.values(DOMAIN_CONSTRAINTS)) {
      for (const c of list) {
        expect(c.specRef).toMatch(/data model|API spec|§/)
      }
    }
  })
})

describe('dispatchGraphWalk -> domain_constraint_violation (deferral F)', () => {
  it('emits domain_constraint_violation when Waybill is missing shipmentInformation', () => {
    const input = {
      '@context': CARGO_CONTEXT_IRI,
      '@id': 'https://example/wb',
      '@type': 'Waybill',
      waybillType: 'MASTER',
      // shipmentInformation missing
    }
    const r = dispatchGraphWalk(input, 'Waybill')
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe('domain_constraint_violation')
      if (r.error.kind === 'domain_constraint_violation') {
        expect(r.error.className).toBe('Waybill')
        expect(r.error.field).toBe('shipmentInformation')
        expect(r.error.specRef).toContain('§5.1')
      }
    }
  })

  it('does not emit when Waybill has shipmentInformation', () => {
    const input = {
      '@context': CARGO_CONTEXT_IRI,
      '@id': 'https://example/wb',
      '@type': 'Waybill',
      shipmentInformation: 'https://example/sh',
    }
    const r = dispatchGraphWalk(input, 'Waybill')
    expect(r.ok).toBe(true)
  })

  it('emits domain_constraint_violation when Shipment.containedPieces is empty', () => {
    const input = {
      '@context': CARGO_CONTEXT_IRI,
      '@id': 'https://example/sh',
      '@type': 'Shipment',
      containedPieces: [],
    }
    const r = dispatchGraphWalk(input, 'Shipment')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.kind).toBe('domain_constraint_violation')
  })
})
