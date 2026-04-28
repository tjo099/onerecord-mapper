// src/result.ts

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: ParseError }

export type ParseError =
  | {
      kind: 'unknown_context'
      got: string
      expected: string[]
      path: string
      meta?: Record<string, unknown>
    }
  | {
      kind: 'mixed_context'
      got: string[]
      allowed: string[]
      path: string
      meta?: Record<string, unknown>
    }
  | { kind: 'missing_type'; objectId?: string; path: string; meta?: Record<string, unknown> }
  | {
      kind: 'unknown_type'
      got: string
      objectId?: string
      path: string
      meta?: Record<string, unknown>
    }
  | {
      kind: 'wrong_type_for_endpoint'
      expected: string
      got: string
      path: string
      meta?: Record<string, unknown>
    }
  | { kind: 'missing_id'; objectType: string; path: string; meta?: Record<string, unknown> }
  | {
      kind: 'invalid_iri'
      got: string
      reason: 'malformed' | 'disallowed_scheme' | 'disallowed_host' | 'has_userinfo'
      path: string
      meta?: Record<string, unknown>
    }
  | { kind: 'duplicate_id_in_graph'; iri: string; path: string; meta?: Record<string, unknown> }
  | {
      kind: 'cardinality_violation'
      field: string
      expected: string
      got: number
      path: string
      meta?: Record<string, unknown>
    }
  | { kind: 'circular_reference'; cyclePath: string[]; meta?: Record<string, unknown> }
  | {
      kind: 'zod_validation'
      issues: { path: string; message: string; code: string }[]
      meta?: Record<string, unknown>
    }
  | {
      kind: 'forbidden_state_transition'
      from: string
      to: string
      reason?: string
      path: string
      meta?: Record<string, unknown>
    }
  | {
      kind: 'operation_field_not_allowed'
      field: string
      allowedFields: ReadonlyArray<string>
      meta?: Record<string, unknown>
    }
  | {
      kind: 'change_partial_failure'
      failedAt: number
      total: number
      cause: ParseError
      meta?: Record<string, unknown>
    }
  | {
      kind: 'payload_too_large'
      sizeBytes: number
      limitBytes: number
      meta?: Record<string, unknown>
    }
  | {
      kind: 'depth_limit_exceeded'
      depth: number
      limit: number
      path: string
      meta?: Record<string, unknown>
    }
  | {
      kind: 'node_count_limit_exceeded'
      count: number
      limit: number
      meta?: Record<string, unknown>
    }
  | {
      kind: 'string_too_long'
      length: number
      limit: number
      path: string
      meta?: Record<string, unknown>
    }
  | {
      kind: 'array_too_long'
      length: number
      limit: number
      path: string
      meta?: Record<string, unknown>
    }
  | {
      kind: 'prototype_pollution_attempt'
      key: string
      path: string
      meta?: Record<string, unknown>
    }
  | {
      kind: 'incompatible_ontology_version'
      serverVersion: string
      mapperVersion: string
      meta?: Record<string, unknown>
    }
  // v3 (A1-R2-B2): JSON-pointer traversal failures used to be reported as `invalid_iri`,
  // which abuses the IRI-validation variant. `invalid_pointer` is the right discriminator
  // for "the JSON pointer in an Operation could not be resolved on the target object".
  | {
      kind: 'invalid_pointer'
      pointer: string
      reason: 'empty' | 'segment_not_object' | 'segment_missing'
      path: string
      meta?: Record<string, unknown>
    }
  // v0.2 (deferral C, closes deviation #8): emitted by the pre-Zod check
  // at safety/blank-node.ts when an `@id` value uses the JSON-LD blank-node
  // syntax (`_:b0`-style). Per spec §3.2 the canonical wire form forbids
  // blank nodes — peers must use stable IRIs.
  | {
      kind: 'blank_node_forbidden'
      blankId: string
      path: string
      meta?: Record<string, unknown>
    }
  // v0.2 (deferral D, closes deviation #9): emitted by the dispatch
  // graph-walk when an IRI string is not in RFC 3987 / spec §3.2
  // canonical form (lowercase scheme, lowercase host, no default port).
  // Opt-in only (dispatch namespace + createMapper({ graphWalk: true })) —
  // default deserializers stay v0.1.x-permissive.
  | {
      kind: 'iri_not_canonical'
      iri: string
      reason: 'scheme_not_lowercase' | 'host_not_lowercase' | 'default_port'
      path: string
      meta?: Record<string, unknown>
    }
  // v0.2 (deferral E, closes deviation #10): emitted by the dispatch
  // graph-walk when the root `@context` is an array whose LAST element
  // is not in the allowlist. JSON-LD 1.1 §3.7 specifies later items
  // override earlier ones, so the last item is the effective context
  // for term definitions. Opt-in via dispatch only — default
  // assertContextAllowed preserves v0.1.x set semantics.
  | {
      kind: 'context_order_violation'
      got: string[]
      lastUnallowed: string
      path: string
      meta?: Record<string, unknown>
    }
  // v0.2 (deferral F, partially closes deviation #6): emitted by the
  // dispatch graph-walk when a root-level domain-semantic cardinality
  // constraint is violated (e.g. Waybill missing the required
  // `shipmentInformation`). v0.3 expands to AWB consistency,
  // total-pieces/weight sums, and reference resolvability.
  | {
      kind: 'domain_constraint_violation'
      className: string
      field: string
      expected: 'required'
      specRef: string
      path: string
      meta?: Record<string, unknown>
    }

/**
 * Manifest of every ParseError kind — single source of truth.
 * v3 (A1-R2-B2): bumped 21 -> 22 with the addition of `invalid_pointer`.
 * v0.2 (deferral C): bumped 22 -> 23 with the addition of `blank_node_forbidden`.
 */
export const PARSE_ERROR_KINDS = [
  'unknown_context',
  'mixed_context',
  'missing_type',
  'unknown_type',
  'wrong_type_for_endpoint',
  'missing_id',
  'invalid_iri',
  'duplicate_id_in_graph',
  'cardinality_violation',
  'circular_reference',
  'zod_validation',
  'forbidden_state_transition',
  'operation_field_not_allowed',
  'change_partial_failure',
  'payload_too_large',
  'depth_limit_exceeded',
  'node_count_limit_exceeded',
  'string_too_long',
  'array_too_long',
  'prototype_pollution_attempt',
  'incompatible_ontology_version',
  'invalid_pointer',
  'blank_node_forbidden',
  'iri_not_canonical',
  'context_order_violation',
  'domain_constraint_violation',
] as const satisfies ReadonlyArray<ParseError['kind']>

/**
 * v3 (A2-R2-B5, A3-R2-m1): explicit map from `ParseError.kind` to the test file
 * that exercises it under `test/deserialize-errors/`. Several kinds collapse into
 * one file (e.g., `depth_limit_exceeded` and `node_count_limit_exceeded` both point
 * to `nested-depth.test.ts`; `invalid_pointer` and `prototype_pollution_attempt`
 * share `prototype-key-injection.test.ts`). The manifest test consumes this map
 * rather than computing filenames from `kind.replace(/_/g, '-')`, which is what
 * v2 attempted and which produced day-one failures because file table rows
 * 93-108 used 5 collapsed names that the algorithm did not know about.
 *
 * Contract: every kind maps to a file under test/deserialize-errors/. The file
 * may contain assertions for multiple kinds. Adding a new ParseError kind
 * requires: (1) append to union, (2) append to PARSE_ERROR_KINDS, (3) add
 * an entry here pointing at the file that should exercise it.
 */
export const PARSE_ERROR_KIND_TO_FILE: Record<ParseError['kind'], string> = {
  unknown_context: 'unknown-context.test.ts',
  mixed_context: 'mixed-context.test.ts',
  missing_type: 'missing-type.test.ts',
  unknown_type: 'zod-shape.test.ts',
  wrong_type_for_endpoint: 'wrong-type.test.ts',
  missing_id: 'missing-id.test.ts',
  invalid_iri: 'invalid-iri.test.ts',
  duplicate_id_in_graph: 'duplicate-id-in-graph.test.ts',
  cardinality_violation: 'cardinality.test.ts',
  circular_reference: 'circular-reference.test.ts',
  zod_validation: 'zod-shape.test.ts',
  forbidden_state_transition: 'forbidden-state-transition.test.ts',
  operation_field_not_allowed: 'operation-field-not-allowed.test.ts',
  change_partial_failure: 'zod-shape.test.ts',
  payload_too_large: 'payload-too-large.test.ts',
  depth_limit_exceeded: 'nested-depth.test.ts',
  node_count_limit_exceeded: 'nested-depth.test.ts',
  string_too_long: 'zod-shape.test.ts',
  array_too_long: 'zod-shape.test.ts',
  prototype_pollution_attempt: 'prototype-key-injection.test.ts',
  incompatible_ontology_version: 'zod-shape.test.ts',
  invalid_pointer: 'prototype-key-injection.test.ts',
  blank_node_forbidden: 'blank-node.test.ts',
  iri_not_canonical: 'iri-canonical.test.ts',
  context_order_violation: 'context-order.test.ts',
  domain_constraint_violation: 'domain-constraints.test.ts',
}

/** Public-safe redaction of a ParseError. By default exposes only `kind`. */
export type PublicParseError = {
  kind: ParseError['kind']
  path?: string
}

/** Programmer-error class thrown by non-strict serializers. */
export class SerializationError extends Error {
  readonly code: 'invalid_application_object' | 'iri_construction_failed'
  readonly details: unknown
  constructor(
    code: 'invalid_application_object' | 'iri_construction_failed',
    message: string,
    details: unknown,
  ) {
    super(message)
    this.name = 'SerializationError'
    this.code = code
    this.details = details
  }
}

export const ok = <T>(value: T): ParseResult<T> => ({ ok: true, value })
export const err = <T = never>(error: ParseError): ParseResult<T> => ({ ok: false, error })
