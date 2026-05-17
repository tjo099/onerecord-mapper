// test/unit/version/constants.test.ts
import { describe, expect, it } from 'vitest'
import {
  API_CONTEXT_IRI,
  API_SPEC_VERSION,
  CARGO_CONTEXT_IRI,
  CARGO_ONTOLOGY_VERSION,
  __VERSION__,
  assertOntologyVersion,
} from '../../../src/version.js'

describe('version constants', () => {
  it('pins ontology versions to spec §13', () => {
    expect(CARGO_ONTOLOGY_VERSION).toBe('3.2.0')
    expect(API_SPEC_VERSION).toBe('2.2.0')
  })

  it('exposes mapper __VERSION__ as semver', () => {
    expect(__VERSION__).toMatch(/^\d+\.\d+\.\d+(-[a-z]+)?$/)
  })

  it('uses the official IATA OneRecord context IRIs', () => {
    expect(CARGO_CONTEXT_IRI).toBe('https://onerecord.iata.org/ns/cargo')
    expect(API_CONTEXT_IRI).toBe('https://onerecord.iata.org/ns/api')
  })
})

describe('assertOntologyVersion — exact-alias accepted set', () => {
  it('does not throw for 3.2.0 (canonical pin)', () => {
    expect(() => assertOntologyVersion('3.2.0')).not.toThrow()
  })

  it('does not throw for 3.2 (legacy alias)', () => {
    expect(() => assertOntologyVersion('3.2')).not.toThrow()
  })

  it('throws incompatible_ontology_version for 3.2.1', () => {
    expect(() => assertOntologyVersion('3.2.1')).toThrow(/incompatible_ontology_version/)
  })

  it('throws incompatible_ontology_version for 4.0', () => {
    expect(() => assertOntologyVersion('4.0')).toThrow(/incompatible_ontology_version/)
  })
})
