// src/version.ts
export {
  CARGO_CONTEXT_IRI,
  API_CONTEXT_IRI,
  ALLOWED_CONTEXTS,
  assertContextAllowed,
} from './context.js'

export const __VERSION__ = '0.3.0' as const
export const CARGO_ONTOLOGY_VERSION = '3.2.0' as const
export const API_SPEC_VERSION = '2.2.0' as const

/**
 * Exact-alias accepted set for ontology version checks.
 * '3.2' is the legacy short-form alias for '3.2.0' (same endorsed standard).
 * '3.2.1' is master-only (not endorsed) and is intentionally rejected.
 * NOT a prefix/startsWith check — only the listed exact strings pass.
 */
const ACCEPTED_ONTOLOGY_VERSIONS = new Set(['3.2.0', '3.2'])

import type { ServerInformation } from './classes/server-information/index.js'
import type { ParseError } from './result.js'

/**
 * Hard-fail if the consumer's expected ontology version is not in the
 * accepted set. Use at consumer startup to surface mismatch loudly.
 * Accepts '3.2.0' (canonical) and '3.2' (legacy alias). Rejects all others
 * including '3.2.1' (master-only, not endorsed).
 */
export function assertOntologyVersion(expected: string): void {
  if (!ACCEPTED_ONTOLOGY_VERSIONS.has(expected)) {
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
 *
 * Compatible iff `cargoOntologyVersion` is in the accepted set
 * ('3.2.0' or '3.2'). null or any other value (including '3.2.1') → false.
 */
export function checkServerInformation(si: ServerInformation): ServerCompatibility {
  const serverOntologyVersion = si.cargoOntologyVersion ?? null
  if (serverOntologyVersion === null) {
    return {
      compatible: false,
      mapperOntologyVersion: CARGO_ONTOLOGY_VERSION,
      serverOntologyVersion: null,
      reason: 'ServerInformation did not advertise cargoOntologyVersion',
    }
  }
  if (!ACCEPTED_ONTOLOGY_VERSIONS.has(serverOntologyVersion)) {
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
