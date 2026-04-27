// src/version.ts
export {
  CARGO_CONTEXT_IRI,
  API_CONTEXT_IRI,
  ALLOWED_CONTEXTS,
  assertContextAllowed,
} from './context.js'

export const __VERSION__ = '0.0.0-prerelease' as const
export const CARGO_ONTOLOGY_VERSION = '3.2' as const
export const API_SPEC_VERSION = '2.2.0' as const
// assertOntologyVersion + checkServerInformation added in Task 16

import type { ParseError } from './result.js'

/**
 * Hard-fail if the consumer's expected ontology version does not match
 * the mapper's pin. Use at consumer startup to surface mismatch loudly.
 */
export function assertOntologyVersion(expected: string): void {
  if (expected !== CARGO_ONTOLOGY_VERSION) {
    const error: ParseError = {
      kind: 'incompatible_ontology_version',
      serverVersion: expected,
      mapperVersion: CARGO_ONTOLOGY_VERSION,
    }
    throw new Error(
      `incompatible_ontology_version: expected=${expected} mapper=${CARGO_ONTOLOGY_VERSION}`,
      { cause: error },
    )
  }
}

/** Minimal shape — full ServerInformationSchema lands in Task 47. */
export interface ServerInformationLike {
  '@context': string | string[]
  '@type': 'ServerInformation'
  '@id': string
  cargoOntologyVersion?: string
  apiSpecVersion?: string
}

export interface ServerCompatibility {
  compatible: boolean
  mapperOntologyVersion: string
  serverOntologyVersion: string | null
  reason?: string
}

/**
 * Inspect a deserialized `ServerInformation` and report compatibility with
 * this mapper's ontology pin. Returns structured result rather than throwing
 * so consumers can warn-and-continue or hard-fail per their policy.
 */
export function checkServerInformation(si: ServerInformationLike): ServerCompatibility {
  const serverOntologyVersion = si.cargoOntologyVersion ?? null
  if (serverOntologyVersion === null) {
    return {
      compatible: false,
      mapperOntologyVersion: CARGO_ONTOLOGY_VERSION,
      serverOntologyVersion: null,
      reason: 'ServerInformation did not advertise cargoOntologyVersion',
    }
  }
  if (serverOntologyVersion !== CARGO_ONTOLOGY_VERSION) {
    return {
      compatible: false,
      mapperOntologyVersion: CARGO_ONTOLOGY_VERSION,
      serverOntologyVersion,
      reason: `Server reports cargoOntologyVersion=${serverOntologyVersion}, mapper pinned to ${CARGO_ONTOLOGY_VERSION}`,
    }
  }
  return {
    compatible: true,
    mapperOntologyVersion: CARGO_ONTOLOGY_VERSION,
    serverOntologyVersion,
  }
}
