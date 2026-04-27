// test/unit/version/ontology-version-check.test.ts
import { describe, expect, it } from 'vitest'
import type { ServerInformation } from '../../../src/classes/server-information/index.js'
import {
  CARGO_ONTOLOGY_VERSION,
  assertOntologyVersion,
  checkServerInformation,
} from '../../../src/version.js'

/** Minimal valid ServerInformation for checkServerInformation tests. */
function si(extra: Partial<ServerInformation> = {}): ServerInformation {
  return {
    '@context': 'https://onerecord.iata.org/ns/cargo',
    '@type': 'ServerInformation',
    '@id': 'https://example.com/api',
    serverEndpoint: 'https://example.com/api' as ServerInformation['serverEndpoint'],
    ...extra,
  } as ServerInformation
}

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
    const r = checkServerInformation(si({ cargoOntologyVersion: CARGO_ONTOLOGY_VERSION }))
    expect(r.compatible).toBe(true)
    expect(r.serverOntologyVersion).toBe(CARGO_ONTOLOGY_VERSION)
  })

  it('returns compatible:false with reason when versions differ', () => {
    const r = checkServerInformation(si({ cargoOntologyVersion: '3.1' }))
    expect(r.compatible).toBe(false)
    expect(r.reason).toContain('3.1')
  })

  it('returns null serverOntologyVersion when ServerInformation omits it', () => {
    const r = checkServerInformation(si())
    expect(r.serverOntologyVersion).toBeNull()
    expect(r.compatible).toBe(false)
  })
})
