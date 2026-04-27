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
