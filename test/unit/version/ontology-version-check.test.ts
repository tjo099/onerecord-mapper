// test/unit/version/ontology-version-check.test.ts
import { describe, expect, it } from 'vitest'
import {
  CARGO_ONTOLOGY_VERSION,
  assertOntologyVersion,
  checkServerInformation,
} from '../../../src/version.js'

describe('assertOntologyVersion', () => {
  it('passes silently when expected matches the pin', () => {
    expect(() => assertOntologyVersion(CARGO_ONTOLOGY_VERSION)).not.toThrow()
  })

  it('throws when expected differs', () => {
    expect(() => assertOntologyVersion('3.1')).toThrow(/incompatible_ontology_version/)
  })
})

describe('checkServerInformation', () => {
  it('returns compatible:true when versions match', () => {
    const r = checkServerInformation({
      '@context': 'https://onerecord.iata.org/ns/api',
      '@type': 'ServerInformation',
      '@id': 'https://example.com/api',
      cargoOntologyVersion: CARGO_ONTOLOGY_VERSION,
    })
    expect(r.compatible).toBe(true)
    expect(r.serverOntologyVersion).toBe(CARGO_ONTOLOGY_VERSION)
  })

  it('returns compatible:false with reason when versions differ', () => {
    const r = checkServerInformation({
      '@context': 'https://onerecord.iata.org/ns/api',
      '@type': 'ServerInformation',
      '@id': 'https://example.com/api',
      cargoOntologyVersion: '3.1',
    })
    expect(r.compatible).toBe(false)
    expect(r.reason).toContain('3.1')
  })

  it('returns null serverOntologyVersion when ServerInformation omits it', () => {
    const r = checkServerInformation({
      '@context': 'https://onerecord.iata.org/ns/api',
      '@type': 'ServerInformation',
      '@id': 'https://example.com/api',
    })
    expect(r.serverOntologyVersion).toBeNull()
    expect(r.compatible).toBe(false)
  })
})
